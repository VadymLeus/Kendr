// frontend/src/modules/support/NewTicketPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../shared/api/api';
import { toast } from 'react-toastify';
import { Button } from '../../shared/ui/elements/Button';
import CustomSelect from '../../shared/ui/elements/CustomSelect';
import { Helmet } from 'react-helmet-async';
import DragDropWrapper from '../../shared/ui/complex/DragDropWrapper';
import { FILE_LIMITS } from '../../shared/config/limits';
import { Send, Info, FileText, ArrowLeft, ShieldAlert, Tag, AlignLeft, AlertCircle, HelpCircle, Wrench, CreditCard, MessageSquare, Handshake, Paperclip, X } from 'lucide-react';

const TICKET_CATEGORIES = [
    { value: 'general', label: 'Загальні питання', icon: HelpCircle },
    { value: 'technical', label: 'Технічна проблема', icon: Wrench },
    { value: 'billing', label: 'Оплата та тариф', icon: CreditCard },
    { value: 'complaint', label: 'Скарга на контент', icon: MessageSquare },
    { value: 'partnership', label: 'Співпраця', icon: Handshake }
];

const NewTicketPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('general');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState([]); 
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const isAppeal = useMemo(() => !!location.state?.site, [location.state]);
    const appealSite = location.state?.site;
    useEffect(() => {
        if (isAppeal && appealSite) {
            setSubject(`Апеляція блокування: ${appealSite.site_path}`);
            setCategory('appeal');
            setBody(
                `Я, власник сайту "${appealSite.title}" (/${appealSite.site_path}), не погоджуюся з рішенням про блокування.\n\n` +
                `Пояснення ситуації:\n[Напишіть тут ваші аргументи]\n\n` +
                `Я зобов'язуюсь усунути порушення, якщо вони будуть підтверджені.`
            );
        }
    }, [isAppeal, appealSite]);

    const handleFileSelect = (files) => {
        if (attachments.length + files.length > FILE_LIMITS.TICKET_ATTACHMENT.MAX_FILES) {
            toast.error(`Максимальна кількість файлів: ${FILE_LIMITS.TICKET_ATTACHMENT.MAX_FILES}`);
            return;
        }
        const validFiles = Array.from(files).filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`Файл ${file.name} не є зображенням.`);
                return false;
            }
            if (file.size > FILE_LIMITS.TICKET_ATTACHMENT.MAX_SIZE) {
                const maxSizeMB = FILE_LIMITS.TICKET_ATTACHMENT.MAX_SIZE / (1024 * 1024);
                toast.error(`Файл ${file.name} перевищує ліміт у ${maxSizeMB} МБ.`);
                return false;
            }
            return true;
        });
        const newAttachments = validFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setAttachments(prev => [...prev, ...newAttachments].slice(0, FILE_LIMITS.TICKET_ATTACHMENT.MAX_FILES));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (indexToRemove) => {
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        return () => attachments.forEach(file => URL.revokeObjectURL(file.preview));
    }, [attachments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || (!body.trim() && attachments.length === 0)) {
            toast.warning('Будь ласка, заповніть всі обов\'язкові поля');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('body', body);
            formData.append('type', isAppeal ? 'appeal' : category);
            if (appealSite?.id) formData.append('siteId', appealSite.id);
            attachments.forEach(file => {
                formData.append('attachments', file);
            });
            await apiClient.post('/support', formData);
            toast.success('Тікет успішно створено! Очікуйте відповідь.');
            navigate('/support/my-tickets');
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 429) {
                toast.error(error.response.data.message || 'Зачекайте перед створенням нового тікета.');
            } else {
                toast.error(error.response?.data?.message || 'Не вдалося створити звернення. Спробуйте пізніше.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <DragDropWrapper 
            onDropFiles={handleFileSelect}
            className="relative min-h-full"
        >
            <Helmet>
                <title>{isAppeal ? 'Оскарження блокування' : 'Нове звернення'} | Kendr Support</title>
            </Helmet>
            <div className="max-w-200 mx-auto p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-(--platform-text-secondary) hover:text-(--platform-text-primary) transition-colors cursor-pointer w-fit bg-transparent border-none p-0 outline-none"
                    >
                        <ArrowLeft size={16} />
                        <span>Повернутися назад</span>
                    </button>
                    <div className="flex items-center gap-3 sm:gap-4 mt-1">
                        <div className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0
                            ${isAppeal ? 'bg-[color-mix(in_srgb,var(--platform-warning),transparent_90%)] text-(--platform-warning)' 
                                       : 'bg-[color-mix(in_srgb,var(--platform-accent),transparent_90%)] text-(--platform-accent)'}
                        `}>
                            {isAppeal ? <ShieldAlert size={20} className="sm:w-6 sm:h-6" /> : <FileText size={20} className="sm:w-6 sm:h-6" />}
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-[28px] font-bold text-(--platform-text-primary) m-0 leading-tight">
                                {isAppeal ? 'Оскарження рішення' : 'Створити тікет'}
                            </h1>
                            <p className="text-sm sm:text-base text-(--platform-text-secondary) mt-1 m-0">
                                {isAppeal 
                                    ? 'Заповніть форму для перегляду рішення модерації' 
                                    : 'Опишіть проблему, і команда підтримки допоможе вам'}
                            </p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-2xl p-5 sm:p-8 shadow-sm flex flex-col gap-5 sm:gap-6">
                    {isAppeal ? (
                        <div className="bg-[color-mix(in_srgb,var(--platform-warning),transparent_95%)] border border-[color-mix(in_srgb,var(--platform-warning),transparent_80%)] rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-3 items-start">
                            <AlertCircle size={20} className="text-(--platform-warning) mt-0.5 shrink-0" />
                            <div>
                                <div className="font-semibold text-(--platform-warning) mb-1 text-sm sm:text-base">Важлива інформація</div>
                                <div className="text-xs sm:text-[13px] text-(--platform-text-secondary) leading-relaxed">
                                    Це звернення буде прив'язане до сайту <strong>/{appealSite.site_path}</strong>. 
                                    Адміністратор перегляне історію змін та причину блокування. 
                                    Надання неправдивої інформації може призвести до блокування акаунту.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[color-mix(in_srgb,var(--platform-accent),transparent_95%)] border border-[color-mix(in_srgb,var(--platform-accent),transparent_80%)] rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-3 items-start">
                            <Info size={20} className="text-(--platform-accent) mt-0.5 shrink-0" />
                            <div>
                                <div className="font-semibold text-(--platform-accent) mb-1 text-sm sm:text-base">Порада</div>
                                <div className="text-xs sm:text-[13px] text-(--platform-text-secondary) leading-relaxed">
                                    Для швидшого вирішення питання додайте посилання на сторінку, де виникла помилка, 
                                    або детально опишіть кроки для її відтворення. Також можна додати скріншоти.
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`grid gap-4 sm:gap-5 ${isAppeal ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {!isAppeal && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-(--platform-text-primary) flex items-center gap-2">
                                    <Tag size={16} /> Категорія питання
                                </label>
                                <CustomSelect 
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    options={TICKET_CATEGORIES}
                                    placeholder="Оберіть категорію"
                                    className="bg-(--platform-bg) h-10.5"
                                />
                            </div>
                        )}
                        <div className={`flex flex-col gap-1.5 ${isAppeal ? 'col-span-1' : ''}`}>
                            <label className="text-sm font-semibold text-(--platform-text-primary) flex items-center gap-2">
                                <FileText size={16} /> Тема
                            </label>
                            <input 
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder={isAppeal ? "Причина апеляції" : "Коротко про суть проблеми"}
                                required
                                readOnly={isAppeal}
                                className="w-full px-4 h-10.5 bg-(--platform-bg) border border-(--platform-border-color) rounded-lg text-(--platform-text-primary) text-sm transition-colors focus:outline-none focus:border-(--platform-accent)"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-(--platform-text-primary) flex items-center gap-2">
                            <AlignLeft size={16} /> Детальний опис
                        </label>
                        <textarea 
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Опишіть ситуацію максимально детально..."
                            required={attachments.length === 0}
                            className="w-full p-4 bg-(--platform-bg) border border-(--platform-border-color) rounded-lg text-(--platform-text-primary) text-sm transition-colors focus:outline-none focus:border-(--platform-accent) min-h-40 sm:min-h-50 resize-y leading-relaxed custom-scrollbar"
                        />
                        {attachments.length > 0 && (
                            <div className="flex gap-2.5 overflow-x-auto mt-2 sm:mt-3 pb-1 hide-scrollbar">
                                {attachments.map((file, index) => (
                                    <div key={index} className="relative w-12.5 h-12.5 sm:w-15 sm:h-15 rounded-lg border border-(--platform-border-color) overflow-hidden shrink-0">
                                        <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 cursor-pointer z-10 border-none hover:bg-black transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-0 border-t border-(--platform-border-color) pt-5 sm:pt-6 mt-2">
                        <div className="w-full md:w-auto">
                            <input 
                                type="file" 
                                multiple 
                                accept="image/jpeg, image/png, image/webp"
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={(e) => handleFileSelect(e.target.files)}
                                disabled={loading || attachments.length >= FILE_LIMITS.TICKET_ATTACHMENT.MAX_FILES}
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading || attachments.length >= FILE_LIMITS.TICKET_ATTACHMENT.MAX_FILES}
                                icon={<Paperclip size={18} />}
                                className="w-full md:w-auto min-h-11"
                            >
                                Прикріпити файл
                            </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <Button 
                                type="button"
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                className="w-full sm:w-auto min-h-11"
                            >
                                Скасувати
                            </Button>
                            <Button 
                                type="submit"
                                variant={isAppeal ? "danger" : "primary"}
                                disabled={loading || (!subject.trim())}
                                icon={!loading && <Send size={18} />}
                                className="w-full sm:w-auto min-h-11"
                            >
                                {loading ? 'Надсилання...' : (isAppeal ? 'Надіслати апеляцію' : 'Створити тікет')}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </DragDropWrapper>
    );
};

export default NewTicketPage;