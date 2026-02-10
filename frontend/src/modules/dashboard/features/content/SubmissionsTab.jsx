// frontend/src/dashboard/modules/features/content/SubmissionsTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../../shared/api/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../../shared/hooks/useConfirm';
import { Input } from '../../../../shared/ui/elements/Input';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect'; 
import { Search, Trash, Check, Star, User, Mail, MessageCircle, Clock, MessageSquare } from 'lucide-react';

const statusConfig = {
    new: { label: 'Нова', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' },
    processing: { label: 'В обробці', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
    done: { label: 'Виконано', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' }
};

const filterOptions = [
    { value: 'all', label: 'Всі' },
    { value: 'new', label: 'Нові', icon: () => <span className="text-[#3B82F6]">●</span> },
    { value: 'processing', label: 'В роботі', icon: () => <span className="text-[#F59E0B]">●</span> },
    { value: 'done', label: 'Готові', icon: () => <span className="text-[#10B981]">●</span> }
];

const DangerButton = ({ onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className="px-3 py-1.5 border border-[#EF4444] text-[#EF4444] rounded-md cursor-pointer text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 hover:bg-[#EF4444] hover:text-white bg-transparent"
        >
            {children}
        </button>
    );
};

const StatusButton = ({ statusKey, currentStatus, onClick }) => {
    const config = statusConfig[statusKey];
    const isActive = currentStatus === statusKey;
    return (
        <button
            onClick={() => onClick(statusKey)}
            style={{
                borderColor: isActive ? config.color : 'var(--platform-border-color)',
                backgroundColor: isActive ? config.color : undefined,
                color: isActive ? '#fff' : undefined,
                '--hover-bg': config.bg,
                '--hover-color': config.color
            }}
            className={`
                flex-1 p-2 rounded-md border cursor-pointer text-xs font-semibold transition-all duration-200
                ${!isActive ? 'bg-transparent text-(--platform-text-secondary) hover:bg-(--hover-bg) hover:text-(--hover-color) hover:-translate-y-px' : ''}
            `}
        >
            {config.label}
        </button>
    );
};

const SubmissionsTab = ({ siteId, onSavingChange }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const { confirm } = useConfirm();
    const [searchParams, setSearchParams] = useSearchParams();
    const fetchSubmissions = async () => {
        try {
            const res = await apiClient.get(`/form/${siteId}`);
            const processed = res.data.map(sub => ({
                ...sub,
                status: sub.form_data?.status || (sub.is_read ? 'processing' : 'new')
            }));
            setSubmissions(processed);
        } catch (err) {
            toast.error('Помилка завантаження');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubmissions(); }, [siteId]);
    useEffect(() => {
        const idFromUrl = searchParams.get('submissionId');
        if (idFromUrl && submissions.length > 0 && (!selectedSubmission || selectedSubmission.id.toString() !== idFromUrl)) {
            const target = submissions.find(s => s.id.toString() === idFromUrl);
            if (target) setSelectedSubmission(target);
        }
    }, [submissions, searchParams]);
    const handleSelectSubmission = (submission) => {
        setSelectedSubmission(submission);
        setSearchParams(prev => { prev.set('submissionId', submission.id); return prev; });
    };

    const handleTogglePin = async (id, e) => {
        e.stopPropagation();
        if (onSavingChange) onSavingChange(true);
        try {
            const res = await apiClient.patch(`/form/${siteId}/${id}/pin`);
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, is_pinned: res.data.is_pinned } : s));
            if (selectedSubmission?.id === id) setSelectedSubmission(prev => ({ ...prev, is_pinned: res.data.is_pinned }));
        } catch (error) { toast.error('Помилка'); } 
        finally { setTimeout(() => onSavingChange && onSavingChange(false), 500); }
    };

    const handleStatusChange = async (id, newStatus) => {
        if (onSavingChange) onSavingChange(true);
        try {
            await apiClient.patch(`/form/${siteId}/${id}/status`, { status: newStatus });
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            if (selectedSubmission?.id === id) setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
            toast.success('Статус оновлено');
        } catch (error) { toast.error('Помилка'); } 
        finally { setTimeout(() => onSavingChange && onSavingChange(false), 500); }
    };

    const handleDelete = async (id) => {
        if (!await confirm({ title: "Видалити?", message: "Це незворотно.", type: "danger", confirmLabel: "Видалити" })) return;
        if (onSavingChange) onSavingChange(true);
        try {
            await apiClient.delete(`/form/${siteId}/${id}`);
            setSubmissions(prev => prev.filter(s => s.id !== id));
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(null);
                setSearchParams(prev => { prev.delete('submissionId'); return prev; });
            }
            toast.success('Видалено');
        } catch (error) { toast.error('Помилка'); } 
        finally { setTimeout(() => onSavingChange && onSavingChange(false), 500); }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => toast.success('Скопійовано')).catch(() => toast.error('Помилка'));
    };
    const filteredSubmissions = useMemo(() => {
        const filtered = submissions.filter(sub => {
            const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
            const sLower = searchTerm.toLowerCase();
            const d = sub.form_data || {};
            const matchesSearch = (d.name || '').toLowerCase().includes(sLower) || 
                                  (d.email || '').toLowerCase().includes(sLower) ||
                                  (d.subject || '').toLowerCase().includes(sLower);
            return matchesStatus && matchesSearch;
        });
        return filtered.sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });
    }, [submissions, filterStatus, searchTerm]);

    if (loading) return <div className="text-center p-10 text-(--platform-text-secondary)">Завантаження...</div>;
    return (
        <div className="w-full h-full flex flex-col px-6 box-border">
            <div className="mb-6 shrink-0">
                <h2 className="text-2xl font-semibold m-0 mb-1 text-(--platform-text-primary) flex items-center gap-2.5">
                    <MessageCircle size={28} />
                    Обробка звернень
                </h2>
                <p className="text-(--platform-text-secondary) m-0 text-sm pl-9.5">
                    Перегляд та управління повідомленнями з контактних форм
                </p>
            </div>

            <div className="bg-(--platform-card-bg) rounded-xl border border-(--platform-border-color) shadow-sm h-[calc(100vh-120px)] flex overflow-hidden">
                <div className="w-85 min-w-75 border-r border-(--platform-border-color) flex flex-col bg-(--platform-card-bg)">
                    <div className="h-17.5 px-4 border-b border-[#2d3748] bg-[#1a202c] flex items-center gap-3 text-white shrink-0">
                        <Input 
                            placeholder="Пошук..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={<Search size={14} style={{color: '#a0aec0'}}/>}
                            style={{
                                margin: 0, 
                                height: '36px', 
                                fontSize: '0.9rem', 
                                background: '#2d3748', 
                                color: '#fff', 
                                border: '1px solid #4a5568',
                                boxShadow: 'none'
                            }}
                            wrapperStyle={{margin: 0, flex: 1}}
                        />
                        <div className="w-30">
                             <CustomSelect 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value)}
                                options={filterOptions}
                                placeholder="Всі"
                                style={{ 
                                    height: '36px', 
                                    background: '#2d3748', 
                                    color: '#fff', 
                                    border: '1px solid #4a5568' 
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2.5 bg-(--platform-card-bg) custom-scrollbar">
                        {filteredSubmissions.length === 0 ? (
                            <div className="text-center py-8 text-(--platform-text-secondary) text-sm">Порожньо</div>
                        ) : (
                            filteredSubmissions.map(sub => {
                                const isSelected = selectedSubmission?.id === sub.id;
                                return (
                                    <div 
                                        key={sub.id} 
                                        onClick={() => handleSelectSubmission(sub)}
                                        className={`
                                            p-3 rounded-lg mb-2 cursor-pointer transition-all duration-150 relative border shadow-sm group
                                            ${isSelected 
                                                ? 'border-(--platform-accent) bg-(--platform-accent)/10' 
                                                : 'border-(--platform-border-color) bg-(--platform-bg) hover:border-(--platform-accent) hover:bg-(--platform-hover-bg)'
                                            }
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-semibold text-sm text-(--platform-text-primary) truncate max-w-45">
                                                {sub.form_data.name || 'Без імені'}
                                            </div>
                                            <button 
                                                onClick={(e) => handleTogglePin(sub.id, e)}
                                                className={`
                                                    bg-transparent border-none cursor-pointer p-0.5 flex transition-colors
                                                    ${sub.is_pinned ? 'text-(--platform-accent)' : 'text-(--platform-text-secondary) opacity-50 group-hover:opacity-100'}
                                                `}
                                                title={sub.is_pinned ? "Відкріпити" : "Закріпити"}
                                            >
                                                <Star size={14} fill={sub.is_pinned ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                        <div className="text-xs text-(--platform-text-secondary) mb-2 truncate">
                                            {sub.form_data.subject || 'Без теми'}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span 
                                                className="text-[0.7rem] px-2 py-0.5 rounded border font-semibold inline-flex items-center gap-1"
                                                style={{
                                                    background: statusConfig[sub.status]?.bg,
                                                    color: statusConfig[sub.status]?.color,
                                                    borderColor: statusConfig[sub.status]?.border,
                                                }}
                                            >
                                                {statusConfig[sub.status]?.label}
                                            </span>
                                            <span className="text-[0.7rem] text-(--platform-text-secondary)">
                                                {new Date(sub.created_at).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden bg-[#1a202c]">
                    {selectedSubmission ? (
                        <>
                            <div className="px-6 border-b border-[#2d3748] flex justify-between items-center bg-[#1a202c] h-17.5 shrink-0 text-white box-border">
                                <div>
                                    <h2 className="m-0 mb-1 text-xl text-white truncate max-w-125">
                                        {selectedSubmission.form_data.subject || 'Без теми'}
                                    </h2>
                                    <div className="flex items-center gap-2.5 text-[#a0aec0] text-xs">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12}/> {new Date(selectedSubmission.created_at).toLocaleString('uk-UA')}
                                        </span>
                                        <span>#{selectedSubmission.id}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => handleTogglePin(selectedSubmission.id, e)}
                                        title={selectedSubmission.is_pinned ? "Відкріпити" : "Закріпити"}
                                        style={{
                                            color: selectedSubmission.is_pinned ? 'var(--platform-accent)' : '#a0aec0',
                                            borderColor: selectedSubmission.is_pinned ? 'var(--platform-accent)' : '#4a5568',
                                            background: selectedSubmission.is_pinned ? '#2d3748' : 'transparent', 
                                        }}
                                        className="border rounded-md cursor-pointer px-2.5 py-1.5 flex items-center transition-all duration-200"
                                    >
                                        <Star size={16} fill={selectedSubmission.is_pinned ? "currentColor" : "none"} />
                                    </button>
                                    <DangerButton onClick={() => handleDelete(selectedSubmission.id)}>
                                        <Trash size={16} /> Видалити
                                    </DangerButton>
                                </div>
                            </div>
                            <div className="custom-scrollbar p-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div className="bg-(--platform-card-bg) p-4 rounded-lg border border-(--platform-border-color) shadow-sm">
                                        <div className="text-xs uppercase text-(--platform-text-secondary) font-bold mb-2.5 flex items-center gap-1.5">
                                            <User size={14}/> Від кого
                                        </div>
                                        <div className="font-semibold text-base mb-1 text-(--platform-text-primary)">
                                            {selectedSubmission.form_data.name}
                                        </div>
                                        <div 
                                            onClick={() => copyToClipboard(selectedSubmission.form_data.email)}
                                            className="text-(--platform-accent) cursor-pointer flex items-center gap-1.5 text-sm"
                                            title="Копіювати"
                                        >
                                            <Mail size={14}/> {selectedSubmission.form_data.email}
                                        </div>
                                    </div>
                                    <div className="bg-(--platform-card-bg) p-4 rounded-lg border border-(--platform-border-color) shadow-sm">
                                        <div className="text-xs uppercase text-(--platform-text-secondary) font-bold mb-2.5 flex items-center gap-1.5">
                                            <Check size={14}/> Статус
                                        </div>
                                        <div className="flex gap-1.5">
                                            {Object.keys(statusConfig).map(key => (
                                                <StatusButton 
                                                    key={key} 
                                                    statusKey={key} 
                                                    currentStatus={selectedSubmission.status} 
                                                    onClick={(k) => handleStatusChange(selectedSubmission.id, k)} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-(--platform-card-bg) p-6 rounded-lg border border-(--platform-border-color) min-h-50 shadow-sm">
                                    <div className="text-xs uppercase text-(--platform-text-secondary) font-bold mb-2.5 flex items-center gap-1.5">
                                        <MessageSquare size={14}/> Повідомлення
                                    </div>
                                    <div className="whitespace-pre-wrap leading-relaxed text-(--platform-text-primary) text-base">
                                        {selectedSubmission.form_data.message || <span className="text-(--platform-text-secondary) italic">Текст повідомлення відсутній</span>}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-[#a0aec0]">
                            <div className="mb-4 opacity-10">
                                <Mail size={64} strokeWidth={1.5} />
                            </div>
                            <div className="text-lg">Оберіть заявку зі списку</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmissionsTab;