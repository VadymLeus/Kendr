// frontend/src/modules/admin/components/BillingDetailsPanel.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BaseDetailsPanel from './BaseDetailsPanel';
import Avatar from '../../../shared/ui/elements/Avatar';
import { Button } from '../../../shared/ui/elements/Button';
import { Copy, ExternalLink, Calendar, CreditCard, DollarSign, Store, User, Hash, Package, CheckCircle, Clock, XCircle, Ban, RotateCcw } from 'lucide-react';

const STATUS_CONFIG = {
    success: { bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', color: 'var(--platform-success)', label: 'Успішно', icon: CheckCircle },
    completed: { bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', color: 'var(--platform-success)', label: 'Виконано', icon: CheckCircle },
    paid: { bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', color: 'var(--platform-success)', label: 'Оплачено', icon: DollarSign },
    shipped: { bg: 'color-mix(in srgb, var(--platform-accent), transparent 90%)', color: 'var(--platform-accent)', label: 'Відправлено', icon: Package },
    pending: { bg: 'color-mix(in srgb, var(--platform-warning), transparent 90%)', color: 'var(--platform-warning)', label: 'В очікуванні', icon: Clock },
    failed: { bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', color: 'var(--platform-danger)', label: 'Помилка', icon: XCircle },
    cancelled: { bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', color: 'var(--platform-danger)', label: 'Скасовано', icon: Ban },
    refunded: { bg: 'var(--platform-hover-bg)', color: 'var(--platform-text-secondary)', label: 'Повернення', icon: RotateCcw }
};

const BillingDetailsPanel = ({ item, type, onClose }) => {
    const navigate = useNavigate();
    if (!item) return null;
    const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const StatusIcon = st.icon;
    const handleCopyId = () => {
        navigator.clipboard.writeText(item.id);
        toast.success('ID скопійовано!');
    };
    
    const handleVisitProfile = (slugOrUsername) => {
        if (slugOrUsername) navigate(`/profile/${slugOrUsername}`);
    };
    const isPlatform = type === 'platform';
    return (
        <BaseDetailsPanel title="Деталі операції" onClose={onClose}>
            <div className="text-center mb-8">
                <div className="text-[12px] text-(--platform-text-secondary) mb-1">Повний ID транзакції</div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <code className="text-[14px] sm:text-[16px] font-bold text-(--platform-text-primary) bg-(--platform-bg) px-3 py-1.5 rounded-lg border border-(--platform-border-color) break-all text-center max-w-full">
                        {item.id}
                    </code>
                    <Button variant="ghost" size="sm" onClick={handleCopyId} className="p-1.5 h-auto w-auto shrink-0" title="Скопіювати ID">
                        <Copy size={16} />
                    </Button>
                </div>
            </div>
            <div className="mb-7">
                <div className="bg-(--platform-bg) p-4 rounded-xl border border-(--platform-border-color)">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-(--platform-border-color) pb-4">
                        <div>
                            <div className="text-[13px] text-(--platform-text-secondary) mb-1">Сума операції</div>
                            <div className="text-2xl font-bold text-(--platform-text-primary) flex items-baseline gap-1">
                                {Number(item.amount).toFixed(2)} <span className="text-[16px] text-(--platform-text-secondary)">{item.currency}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                            <div className="text-[13px] text-(--platform-text-secondary) mb-1">Статус</div>
                            <div 
                                className="px-3 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5"
                                style={{ background: st.bg, color: st.color }}
                            >
                                <StatusIcon size={14} /> {st.label}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-start sm:items-center mb-3 text-[14px] flex-col sm:flex-row gap-1">
                        <div className="text-(--platform-text-secondary) flex items-center gap-2 shrink-0">
                            <Calendar size={16} /> Дата та час
                        </div>
                        <div className="font-medium text-(--platform-text-primary) text-left sm:text-right">
                            {new Date(item.created_at).toLocaleDateString('uk-UA')} о {new Date(item.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                    </div>
                    {item.provider_id && (
                        <div className="flex justify-between items-start sm:items-center text-[14px] flex-col sm:flex-row gap-1">
                            <div className="text-(--platform-text-secondary) flex items-center gap-2 shrink-0">
                                <Hash size={16} /> Шлюз ID (LiqPay)
                            </div>
                            <div className="font-mono font-medium text-(--platform-text-primary) text-left sm:text-right break-all max-w-full">
                                {item.provider_id}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mb-7">
                <div className="text-[12px] uppercase text-(--platform-text-secondary) mb-3 font-bold tracking-wider">Предмет угоди</div>
                <div className="bg-(--platform-bg) p-5 rounded-xl border border-(--platform-border-color)">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-(--platform-text-primary)/5 rounded-lg shrink-0">
                            <Package size={24} className="text-(--platform-text-primary)" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[15px] font-semibold text-(--platform-text-primary) mb-1 leading-snug wrap-break-word">
                                {isPlatform ? item.description : (item.products || 'Товари з кошика')}
                            </div>
                            {!isPlatform && item.site_path && (
                                <a href={`/site/${item.site_path}`} target="_blank" rel="noreferrer" className="inline-block no-underline mt-2">
                                    <Button variant="ghost" size="sm" className="p-0 h-auto text-(--platform-accent) hover:text-(--platform-text-primary) transition-colors">
                                        <ExternalLink size={14} className="mr-1.5" />
                                        Перейти до сайту магазину
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mb-7">
                <div className="text-[12px] uppercase text-(--platform-text-secondary) mb-3 font-bold tracking-wider">Учасники угоди</div>
                <div className="text-[12px] text-(--platform-text-secondary) mb-2">Покупець (Платник)</div>
                <div 
                    className={`flex items-center gap-3 bg-(--platform-bg) py-3 px-4 rounded-xl border border-(--platform-border-color) mb-4 transition-colors ${isPlatform ? 'cursor-pointer hover:border-(--platform-accent)' : ''}`}
                    onClick={() => handleVisitProfile(isPlatform ? (item.user_slug || item.user_name) : null)}
                >
                    <Avatar url={item.user_avatar} name={isPlatform ? item.user_name : item.customer_name} size={40} />
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-(--platform-text-primary) flex items-center gap-1.5 truncate">
                            <span className="truncate">{isPlatform ? item.user_name : item.customer_name}</span>
                            {isPlatform && <ExternalLink size={12} className="opacity-50 shrink-0" />}
                        </div>
                        <div className="text-[13px] text-(--platform-text-secondary) truncate">
                            {isPlatform ? item.user_email : item.customer_email}
                        </div>
                    </div>
                </div>
                {!isPlatform && (
                    <>
                        <div className="text-[12px] text-(--platform-text-secondary) mb-2 mt-4">Продавець (Отримувач)</div>
                        <div 
                            className="flex items-center gap-3 bg-(--platform-bg) py-3 px-4 rounded-xl border border-(--platform-border-color) transition-colors cursor-pointer hover:border-(--platform-accent)"
                            onClick={() => handleVisitProfile(item.owner_slug || item.owner_name)}
                        >
                            <Avatar url={item.owner_avatar} name={item.owner_name} size={40} />
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-(--platform-text-primary) flex items-center gap-1.5 truncate">
                                    <span className="truncate">{item.owner_name}</span>
                                    <ExternalLink size={12} className="opacity-50 shrink-0" />
                                </div>
                                <div className="text-[13px] text-(--platform-text-secondary) truncate">
                                    Магазин: <strong className="font-semibold text-(--platform-text-primary)">{item.site_title}</strong>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

        </BaseDetailsPanel>
    );
};

export default BillingDetailsPanel;