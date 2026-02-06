// frontend/src/modules/admin/components/SiteDetailsPanel.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/elements/Button';
import BaseDetailsPanel from './BaseDetailsPanel';
import { ExternalLink, Clock, ShieldCheck, RefreshCw, Ban, FileEdit, Eye, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

const calculateTimeLeft = (dateString) => {
    if (!dateString) return { expired: false, text: null };
    const diffMs = new Date(dateString) - new Date();
    if (diffMs <= 0) return { expired: true, text: "Час вийшов" };
    const days = Math.floor(diffMs / (86400000));
    const hours = Math.floor((diffMs % (86400000)) / (3600000));
    return { expired: false, text: `${days}д ${hours}год` };
};

const SiteDetailsPanel = ({ site, onClose, actions }) => {
    const navigate = useNavigate();
    const statusConfig = {
        published: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Активний', icon: CheckCircle },
        suspended: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Бан', icon: Ban },
        probation: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', label: 'Модерація', icon: ShieldAlert },
        draft: { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', label: 'Чернетка', icon: Clock },
        private: { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', label: 'Приват', icon: Clock }
    };

    const safeStatusKey = site?.status || 'draft';
    const currentStatus = statusConfig[safeStatusKey] || statusConfig.draft;
    const StatusIcon = currentStatus.icon;
    const styles = useMemo(() => ({
        section: { marginBottom: '24px' },
        label: { fontSize: '13px', color: 'var(--platform-text-secondary)', marginBottom: '6px', fontWeight: '500' },
        value: { fontSize: '15px', color: 'var(--platform-text-primary)', fontWeight: '500' },
        infoBox: (type) => ({
            background: type === 'error' ? 'rgba(239, 68, 68, 0.05)' : type === 'warning' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(59, 130, 246, 0.05)',
            border: `1px solid ${type === 'error' ? '#ef444433' : type === 'warning' ? '#f59e0b33' : '#3b82f633'}`,
            padding: '16px', borderRadius: '8px', marginBottom: '24px',
            color: type === 'error' ? '#ef4444' : type === 'warning' ? '#d97706' : '#3b82f6',
            display: 'flex', gap: '12px', alignItems: 'flex-start'
        }),
        statusBadge: { 
            padding: '6px 12px', 
            borderRadius: '6px', 
            fontSize: '13px', 
            fontWeight: '600', 
            textTransform: 'uppercase', 
            background: currentStatus.bg, 
            color: currentStatus.color,
            border: `1px solid ${currentStatus.color}20`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
        }
    }), [currentStatus]);
    if (!site) return null;
    const isSuspended = site.status === 'suspended';
    const isProbation = site.status === 'probation';
    const { expired: isExpired, text: timeLeftString } = calculateTimeLeft(site.deletion_scheduled_for);

    const handleVisitProfile = () => {
        navigate(`/profile/${site.author}`);
    };

    return (
        <BaseDetailsPanel 
            title="Керування сайтом" 
            onClose={onClose} 
            onDelete={() => actions.delete(site.site_path)}
            deleteTitle={isSuspended && (!isExpired && site.appeal_status === 'pending') ? "Спочатку розгляньте апеляцію" : "Видалити назавжди"}
            deleteDisabled={isSuspended && !isExpired && site.appeal_status === 'pending'}
            deleteLabel="Видалити остаточно"
        >
            <div style={styles.section}>
                <div style={styles.label}>Сайт</div>
                <div style={{...styles.value, fontSize: '18px', marginBottom: '8px', fontWeight: 'bold'}}>{site.title}</div>
                <a href={`/site/${site.site_path}`} target="_blank" rel="noreferrer" style={{textDecoration: 'none'}}>
                    <Button 
                        variant="outline" 
                        icon={<ExternalLink size={16} />} 
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Перейти на сайт
                    </Button>
                </a>
            </div>

            <div style={styles.section}>
                <div style={styles.label}>Власник</div>
                <div 
                    onClick={handleVisitProfile}
                    style={{
                        ...styles.value, 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        transition: 'color 0.2s'
                    }}
                    className="hover:text-(--platform-accent)"
                    title="Відкрити профіль користувача"
                >
                    {site.author}
                    <ExternalLink size={14} style={{ opacity: 0.5 }} />
                </div>
                <div style={{fontSize: '13px', opacity: 0.7}}>{site.author_email}</div>
            </div>

            <div style={styles.section}>
                <div style={styles.label}>Статус</div>
                <span style={styles.statusBadge}>
                    <StatusIcon size={14} />
                    {currentStatus.label}
                </span>
            </div>

            <div style={styles.section}>
                <div style={styles.label}>Репутація власника</div>
                <div style={{display: 'flex', gap: '4px'}}>
                    {[1, 2, 3].map(i => <div key={i} style={{width: '100%', height: '8px', borderRadius: '4px', background: i <= site.warning_count ? 'var(--platform-danger)' : 'var(--platform-border-color)'}} />)}
                </div>
                <div style={{fontSize: '12px', marginTop: '6px', color: site.warning_count >= 3 ? 'var(--platform-danger)' : 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    {site.warning_count >= 3 && <AlertTriangle size={12}/>} {site.warning_count} / 3 страйків
                </div>
            </div>

            {isSuspended && (
                <div style={styles.infoBox('error')}>
                    <Clock size={20} />
                    <div>
                        <div style={{fontWeight: 'bold', marginBottom: '4px'}}>Сайт призупинено</div>
                        <div style={{fontSize: '13px'}}>До видалення: <strong>{timeLeftString}</strong></div>
                        {isExpired && <div style={{fontSize: '13px', marginTop: '4px', fontWeight: 'bold'}}>Можна видаляти.</div>}
                    </div>
                </div>
            )}

            {isProbation && (
                <div style={styles.infoBox('warning')}>
                    <Eye size={20} />
                    <div>
                        <div style={{fontWeight: 'bold', marginBottom: '4px'}}>Випробувальний термін</div>
                        <div style={{fontSize: '13px'}}>Доступ для редагування відкрито, публікація закрита.</div>
                    </div>
                </div>
            )}

            {site.appeal_status === 'pending' && (
                <div style={styles.infoBox('info')}>
                    <ShieldCheck size={20} />
                    <div>
                        <div style={{fontWeight: 'bold', marginBottom: '4px'}}>Є активна апеляція</div>
                        <div style={{fontSize: '13px'}}>Дата: {new Date(site.appeal_date).toLocaleDateString()}</div>
                    </div>
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', borderTop: '1px solid var(--platform-border-color)', paddingTop: '24px' }}>
                 {(isSuspended || isProbation) ? (
                    <>
                        <Button variant="success" onClick={() => actions.restore(site.site_path)} icon={<RefreshCw size={18} />} style={{ width: '100%' }}>Відновити</Button>
                        {isSuspended && <Button variant="outline-warning" onClick={() => actions.probation(site.site_path)} icon={<FileEdit size={18} />} style={{ width: '100%' }}>Надати доступ до редагування</Button>}
                        {isProbation && <Button variant="outline-danger" onClick={() => actions.suspend(site.site_path)} icon={<Ban size={18} />} style={{ width: '100%' }}>Повернути в бан</Button>}
                    </>
                ) : (
                    <Button variant="warning" onClick={() => actions.suspend(site.site_path)} icon={<Ban size={18} />} style={{ width: '100%' }}>Призупинити (+1 страйк)</Button>
                )}
            </div>
        </BaseDetailsPanel>
    );
};

export default SiteDetailsPanel;