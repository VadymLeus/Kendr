// frontend/src/modules/admin/pages/AdminControlPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { Switch, Input, Button } from '../../../shared/ui/elements';
import { Power, Lock, Megaphone, Save, AlertTriangle, Settings, Clock, MessageSquare, Eye, AlertOctagon } from 'lucide-react';

const AdminControlPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [originalValues, setOriginalValues] = useState(null);
    const [settings, setSettings] = useState({
        maintenance_mode: false,
        editor_locked: false,
        maintenance_message: '', 
        registration_enabled: true
    });
    const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);
    const [timerMinutes, setTimerMinutes] = useState('');
    const [activeTimerEnd, setActiveTimerEnd] = useState(null);
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const res = await apiClient.get('/admin/control/settings');
            setOriginalValues(res.data);
            const rawMessage = res.data.maintenance_message || '';
            let messageText = rawMessage;
            let existingTimer = null;
            if (rawMessage.includes('|||')) {
                const parts = rawMessage.split('|||');
                messageText = parts[0];
                existingTimer = parseInt(parts[1], 10);
            }

            setSettings({
                ...res.data,
                maintenance_message: messageText
            });

            if (messageText.trim() !== '') {
                setIsAnnouncementActive(true);
            }
            if (existingTimer && existingTimer > Date.now()) {
                setActiveTimerEnd(existingTimer);
            }

        } catch (error) {
            console.error('Failed to load settings', error);
            if (error.response && error.response.status === 503) {
                const fallbackSettings = { maintenance_mode: true, editor_locked: false, maintenance_message: '' };
                setSettings(prev => ({ ...prev, maintenance_mode: true }));
                setOriginalValues(fallbackSettings);
                toast.warning('Система в режимі обслуговування. Ви можете вимкнути його.');
            } else {
                toast.error('Не вдалося завантажити налаштування');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanges = useMemo(() => {
        if (!originalValues) return false;
        if (!!settings.maintenance_mode !== !!originalValues.maintenance_mode) return true;
        if (!!settings.editor_locked !== !!originalValues.editor_locked) return true;
        let predictedMessage = '';
        if (isAnnouncementActive) {
            predictedMessage = settings.maintenance_message;
            if (timerMinutes && !isNaN(timerMinutes)) {
                return true; 
            }
            else if (activeTimerEnd && activeTimerEnd > Date.now()) {
                predictedMessage = `${predictedMessage}|||${activeTimerEnd}`;
            }
        }

        const originalMessage = originalValues.maintenance_message || '';
        if (predictedMessage !== originalMessage) return true;

        return false;
    }, [settings, originalValues, isAnnouncementActive, timerMinutes, activeTimerEnd]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            let finalMessage = '';
            if (isAnnouncementActive) {
                finalMessage = settings.maintenance_message;
                if (timerMinutes && !isNaN(timerMinutes)) {
                    const targetTime = Date.now() + (parseInt(timerMinutes) * 60 * 1000);
                    finalMessage = `${finalMessage}|||${targetTime}`;
                    setActiveTimerEnd(targetTime);
                } 
                else if (activeTimerEnd && activeTimerEnd > Date.now()) {
                    finalMessage = `${finalMessage}|||${activeTimerEnd}`;
                }
            }

            const dataToSend = {
                ...settings,
                maintenance_message: finalMessage
            };

            await apiClient.put('/admin/control/settings', dataToSend);
            setOriginalValues(dataToSend);
            setTimerMinutes('');
            setSettings(prev => ({ ...prev, maintenance_message: settings.maintenance_message }));
            toast.success('Налаштування збережено');
        } catch (error) {
            console.error(error);
            toast.error('Помилка збереження');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleAnnouncementToggle = (active) => {
        setIsAnnouncementActive(active);
        if (!active) {
            setTimerMinutes('');
        }
    };

    const AdminTimerPreview = ({ targetTime }) => {
        const [timeLeft, setTimeLeft] = useState(null);
        useEffect(() => {
            if (!targetTime) return;
            const update = () => {
                const now = Date.now();
                const diff = targetTime - now;
                if (diff <= 0) {
                    setTimeLeft(null);
                    return;
                }
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);
                const h = Math.floor((diff / 1000 / 60 / 60));
                
                if (h > 0) {
                    setTimeLeft(`${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
                } else {
                    setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
                }
            };
            update();
            const interval = setInterval(update, 1000);
            return () => clearInterval(interval);
        }, [targetTime]);

        if (!timeLeft) return null;
        return <span> - {timeLeft}</span>;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12 text-(--platform-text-secondary)">Завантаження налаштувань...</div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20 relative">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold mb-1 text-(--platform-text-primary) flex items-center gap-2.5">
                        <Settings size={28} /> Центр управління
                    </h2>
                    <p className="text-(--platform-text-secondary) text-sm m-0 pl-10">
                        Глобальні налаштування платформи та аварійні режими
                    </p>
                </div>
                <div className="shrink-0">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving || !hasChanges} 
                        className={`px-8 min-w-40 transition-all ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
                        size="md"
                        icon={<Save size={18} />}
                    >
                        {isSaving ? 'Збереження...' : 'Зберегти зміни'}
                    </Button>
                </div>
            </div>
            {settings.maintenance_mode && (
                <div className="mb-6 flex items-center justify-center gap-3 bg-(--platform-danger)/10 text-(--platform-danger) px-4 py-3 rounded-lg border border-(--platform-danger)/20 w-full text-center">
                    <AlertTriangle size={20} className="shrink-0" />
                    <span className="text-sm font-medium">Увага! Платформа в режимі обслуговування.</span>
                </div>
            )}
            <div className="space-y-6">
                <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
                    <div className="p-6 border-b border-(--platform-border-color) bg-(--platform-bg) flex items-start gap-4">
                        <div className="p-3 bg-(--platform-danger)/10 text-(--platform-danger) rounded-lg shrink-0">
                            <Power size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-(--platform-text-primary)">Аварійний режим</h3>
                            <p className="text-sm text-(--platform-text-secondary) mt-1">
                                Керування доступом до платформи у критичних ситуаціях.
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 font-semibold text-(--platform-text-primary)">
                                    <AlertOctagon size={16} className={settings.maintenance_mode ? "text-(--platform-danger)" : "text-(--platform-text-secondary)"} />
                                    Технічні роботи
                                    {settings.maintenance_mode && <span className="px-2 py-0.5 bg-(--platform-danger)/10 text-(--platform-danger) text-xs rounded-full">Active</span>}
                                </div>
                                <p className="text-sm text-(--platform-text-secondary) mt-1 ml-6">
                                    Повністю закриває доступ до сайту для користувачів.
                                </p>
                            </div>
                            <Switch 
                                checked={settings.maintenance_mode} 
                                onChange={(checked) => handleChange('maintenance_mode', checked)} 
                            />
                        </div>
                        
                        <div className="h-px bg-(--platform-border-color)" />
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 font-semibold text-(--platform-text-primary)">
                                    <Lock size={16} className={settings.editor_locked ? "text-(--platform-warning)" : "text-(--platform-text-secondary)"} />
                                    Блокування редактора
                                    {settings.editor_locked && <span className="px-2 py-0.5 bg-(--platform-warning)/10 text-(--platform-warning) text-xs rounded-full">Locked</span>}
                                </div>
                                <p className="text-sm text-(--platform-text-secondary) mt-1 ml-6">
                                    Забороняє зберігання будь-яких змін.
                                </p>
                            </div>
                            <Switch 
                                checked={settings.editor_locked} 
                                onChange={(checked) => handleChange('editor_locked', checked)} 
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
                    <div className="p-6 border-b border-(--platform-border-color) bg-(--platform-accent)/5 flex items-start gap-4">
                        <div className="p-3 bg-(--platform-accent)/10 text-(--platform-accent) rounded-lg shrink-0">
                            <Megaphone size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-(--platform-text-primary)">Глобальне оголошення</h3>
                            <p className="text-sm text-(--platform-text-secondary) mt-1">
                                Інформаційний банер з можливістю таймера.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm font-medium text-(--platform-text-primary)">
                                <Eye size={16} /> Показувати банер
                            </label>
                            <Switch 
                                checked={isAnnouncementActive} 
                                onChange={handleAnnouncementToggle} 
                            />
                        </div>
                        <div className={`transition-all duration-300 space-y-4 ${isAnnouncementActive ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale'}`}>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-(--platform-text-primary) mb-2">
                                    <MessageSquare size={16} /> Текст оголошення
                                </label>
                                <Input
                                    value={settings.maintenance_message}
                                    onChange={(e) => handleChange('maintenance_message', e.target.value)}
                                    placeholder="Наприклад: Технічні роботи розпочнуться через"
                                />
                            </div>

                            <div className="w-full">
                                <label className="flex text-sm font-medium text-(--platform-text-primary) mb-2 items-center gap-2 select-none">
                                    <Clock size={16} /> Додати таймер
                                </label>
                                <Input
                                    type="number"
                                    value={timerMinutes}
                                    onChange={(e) => setTimerMinutes(e.target.value)}
                                    placeholder="Наприклад: 30"
                                    min="1"
                                />
                            </div>
                        </div>
                        {isAnnouncementActive && (
                            <div className="bg-(--platform-bg) p-4 rounded-lg border border-dashed border-(--platform-border-color)">
                                <p className="text-xs text-(--platform-text-secondary) mb-2 uppercase tracking-wider font-semibold">Попередній перегляд:</p>
                                <div className="bg-(--platform-accent) text-(--platform-accent-text) px-4 py-2.5 text-sm font-medium text-center flex items-center justify-center gap-2 rounded shadow-sm">
                                    <Megaphone size={16} />
                                    <span>
                                        {settings.maintenance_message} 
                                        {(activeTimerEnd || timerMinutes) && (
                                            <>
                                                {timerMinutes ? 
                                                    ` - ${timerMinutes}:00` : 
                                                    (activeTimerEnd && <AdminTimerPreview targetTime={activeTimerEnd} />)
                                                }
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminControlPage;