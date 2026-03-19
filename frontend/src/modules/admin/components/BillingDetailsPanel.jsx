// frontend/src/modules/admin/components/BillingDetailsPanel.jsx
import React, { useMemo } from 'react';
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
    const styles = useMemo(() => ({
        section: { marginBottom: '28px' },
        sectionTitle: { fontSize: '12px', textTransform: 'uppercase', color: 'var(--platform-text-secondary)', marginBottom: '12px', fontWeight: '700', letterSpacing: '0.5px' },
        row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '14px' },
        rowLabel: { color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' },
        rowValue: { fontWeight: '500', color: 'var(--platform-text-primary)', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' },
        card: { background: 'var(--platform-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--platform-border-color)' },
        participantCard: { display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--platform-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--platform-border-color)', marginBottom: '12px', transition: 'border 0.2s', cursor: 'pointer' }
    }), []);

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
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', color: 'var(--platform-text-secondary)', marginBottom: '4px' }}>Повний ID транзакції</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <code style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--platform-text-primary)', background: 'var(--platform-bg)', padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--platform-border-color)' }}>
                        {item.id}
                    </code>
                    <Button variant="ghost" size="sm" onClick={handleCopyId} style={{ padding: '6px' }} title="Скопіювати ID">
                        <Copy size={16} />
                    </Button>
                </div>
            </div>
            <div style={styles.section}>
                <div style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--platform-border-color)', paddingBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: 'var(--platform-text-secondary)', marginBottom: '4px' }}>Сума операції</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--platform-text-primary)' }}>
                                {Number(item.amount).toFixed(2)} <span style={{ fontSize: '16px', color: 'var(--platform-text-secondary)' }}>{item.currency}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ fontSize: '13px', color: 'var(--platform-text-secondary)', marginBottom: '4px' }}>Статус</div>
                            <div style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', background: st.bg, color: st.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <StatusIcon size={14} /> {st.label}
                            </div>
                        </div>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.rowLabel}><Calendar size={16} /> Дата та час</div>
                        <div style={styles.rowValue}>
                            {new Date(item.created_at).toLocaleDateString('uk-UA')} о {new Date(item.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                    </div>
                    {item.provider_id && (
                        <div style={styles.row}>
                            <div style={styles.rowLabel}><Hash size={16} /> Шлюз ID (LiqPay)</div>
                            <div style={{ ...styles.rowValue, fontFamily: 'monospace' }}>{item.provider_id}</div>
                        </div>
                    )}
                </div>
            </div>
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Предмет угоди</div>
                <div style={{ ...styles.card, padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ padding: '10px', background: 'color-mix(in srgb, var(--platform-text-primary), transparent 95%)', borderRadius: '10px' }}>
                            <Package size={24} color="var(--platform-text-primary)" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--platform-text-primary)', marginBottom: '4px', lineHeight: '1.4' }}>
                                {isPlatform ? item.description : (item.products || 'Товари з кошика')}
                            </div>
                            
                            {!isPlatform && item.site_path && (
                                <a href={`/site/${item.site_path}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                    <Button variant="ghost" size="sm" style={{ padding: 0, height: 'auto', color: 'var(--platform-accent)', marginTop: '8px' }}>
                                        <ExternalLink size={14} style={{ marginRight: '6px' }} />
                                        Перейти до сайту магазину
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Учасники угоди</div>
                <div style={{ fontSize: '12px', color: 'var(--platform-text-secondary)', marginBottom: '8px' }}>Покупець (Платник)</div>
                <div 
                    style={{
                        ...styles.participantCard,
                        cursor: isPlatform ? 'pointer' : 'default'
                    }} 
                    onClick={() => handleVisitProfile(isPlatform ? (item.user_slug || item.user_name) : null)}
                    onMouseEnter={e => { if(isPlatform) e.currentTarget.style.borderColor = 'var(--platform-accent)' }}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--platform-border-color)'}
                >
                    <Avatar url={item.user_avatar} name={isPlatform ? item.user_name : item.customer_name} size={40} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--platform-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isPlatform ? item.user_name : item.customer_name}
                            {isPlatform && <ExternalLink size={12} style={{ opacity: 0.5 }} />}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--platform-text-secondary)' }}>
                            {isPlatform ? item.user_email : item.customer_email}
                        </div>
                    </div>
                </div>
                {!isPlatform && (
                    <>
                        <div style={{ fontSize: '12px', color: 'var(--platform-text-secondary)', marginBottom: '8px', marginTop: '16px' }}>Продавець (Отримувач)</div>
                        <div 
                            style={styles.participantCard} 
                            onClick={() => handleVisitProfile(item.owner_slug || item.owner_name)}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--platform-accent)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--platform-border-color)'}
                        >
                            <Avatar url={item.owner_avatar} name={item.owner_name} size={40} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--platform-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {item.owner_name}
                                    <ExternalLink size={12} style={{ opacity: 0.5 }} />
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--platform-text-secondary)' }}>
                                    Магазин: <strong>{item.site_title}</strong>
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