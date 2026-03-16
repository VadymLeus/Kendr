// frontend/src/modules/admin/components/SiteDetailsPanel.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
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
    const [isSuspendHovered, setIsSuspendHovered] = useState(false);
    const [isRestoreHovered, setIsRestoreHovered] = useState(false);
    const [isProbationHovered, setIsProbationHovered] = useState(false);
    const statusConfig = {
        published: { bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', color: 'var(--platform-success)', label: 'Активний', icon: CheckCircle },
        suspended: { bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', color: 'var(--platform-danger)', label: 'Заблоковано', icon: Ban },
        probation: { bg: 'color-mix(in srgb, var(--platform-warning), transparent 90%)', color: 'var(--platform-warning)', label: 'Модерація', icon: ShieldAlert },
        draft: { bg: 'var(--platform-hover-bg)', color: 'var(--platform-text-secondary)', label: 'Чернетка', icon: Clock },
        private: { bg: 'var(--platform-hover-bg)', color: 'var(--platform-text-secondary)', label: 'Приват', icon: Clock }
    };
    const safeStatusKey = site?.status || 'draft';
    const currentStatus = statusConfig[safeStatusKey] || statusConfig.draft;
    const StatusIcon = currentStatus.icon;
    const styles = useMemo(() => ({
        section: { marginBottom: '24px' },
        label: { fontSize: '13px', color: 'var(--platform-text-secondary)', marginBottom: '6px', fontWeight: '500' },
        value: { fontSize: '15px', color: 'var(--platform-text-primary)', fontWeight: '500' },
        infoBox: (type) => ({
            background: type === 'error' ? 'color-mix(in srgb, var(--platform-danger), transparent 95%)' : type === 'warning' ? 'color-mix(in srgb, var(--platform-warning), transparent 95%)' : 'color-mix(in srgb, var(--platform-accent), transparent 95%)',
            border: `1px solid ${type === 'error' ? 'var(--platform-danger)' : type === 'warning' ? 'var(--platform-warning)' : 'var(--platform-accent)'}`,
            padding: '16px', borderRadius: '8px', marginBottom: '24px',
            color: type === 'error' ? 'var(--platform-danger)' : type === 'warning' ? 'var(--platform-warning)' : 'var(--platform-accent)',
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
            border: `1px solid color-mix(in srgb, ${currentStatus.color}, transparent 80%)`,
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
        const targetIdentifier = site.author_slug || site.author;
        navigate(`/profile/${targetIdentifier}`);
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
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', marginBottom: '16px'}}>
                    <Avatar url={site.logo_url} name={site.title} size={42} />
                    <div>
                        <div style={{...styles.value, fontSize: '18px', fontWeight: 'bold'}}>{site.title}</div>
                        <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)', fontFamily: 'monospace'}}>/{site.site_path}</div>
                    </div>
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div 
                        onClick={handleVisitProfile} 
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Avatar url={site.author_avatar_url} name={site.author} size={42} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div 
                            onClick={handleVisitProfile}
                            style={{
                                ...styles.value, 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                transition: 'color 0.2s',
                                fontWeight: 'bold'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--platform-accent)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--platform-text-primary)'}
                            title="Відкрити профіль користувача"
                        >
                            {site.author}
                            <ExternalLink size={14} style={{ opacity: 0.5 }} />
                        </div>
                        <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)', opacity: 0.8}}>{site.author_email}</div>
                    </div>
                </div>
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
                        <Button 
                            variant="outline" 
                            onClick={() => actions.restore(site.site_path)} 
                            onMouseEnter={() => setIsRestoreHovered(true)}
                            onMouseLeave={() => setIsRestoreHovered(false)}
                            style={{ 
                                width: '100%', 
                                display: 'flex', 
                                justifyContent: 'center', 
                                gap: '8px', 
                                background: 'transparent', 
                                color: isRestoreHovered ? 'var(--platform-success)' : 'var(--platform-text-primary)', 
                                border: `1px solid ${isRestoreHovered ? 'var(--platform-success)' : 'var(--platform-border-color)'}`,
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            <RefreshCw size={18} />
                            Відновити
                        </Button>
                        {isSuspended && (
                            <Button 
                                variant="outline" 
                                onClick={() => actions.probation(site.site_path)} 
                                onMouseEnter={() => setIsProbationHovered(true)}
                                onMouseLeave={() => setIsProbationHovered(false)}
                                style={{ 
                                    width: '100%', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    background: 'transparent', 
                                    color: isProbationHovered ? 'var(--platform-warning)' : 'var(--platform-text-primary)', 
                                    border: `1px solid ${isProbationHovered ? 'var(--platform-warning)' : 'var(--platform-border-color)'}`,
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                <FileEdit size={18} />
                                Надати доступ до редагування
                            </Button>
                        )}
                        {isProbation && (
                            <Button 
                                variant="outline" 
                                onClick={() => actions.suspend(site.site_path)} 
                                onMouseEnter={() => setIsSuspendHovered(true)}
                                onMouseLeave={() => setIsSuspendHovered(false)}
                                style={{ 
                                    width: '100%', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    background: 'transparent', 
                                    color: isSuspendHovered ? 'var(--platform-danger)' : 'var(--platform-text-primary)', 
                                    border: `1px solid ${isSuspendHovered ? 'var(--platform-danger)' : 'var(--platform-border-color)'}`,
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                <Ban size={18} />
                                Заблокувати
                            </Button>
                        )}
                    </>
                ) : (
                    <Button 
                        variant="outline" 
                        onClick={() => actions.suspend(site.site_path)} 
                        onMouseEnter={() => setIsSuspendHovered(true)}
                        onMouseLeave={() => setIsSuspendHovered(false)}
                        style={{ 
                            width: '100%', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '8px', 
                            background: 'transparent', 
                            color: isSuspendHovered ? 'var(--platform-danger)' : 'var(--platform-text-primary)', 
                            border: `1px solid ${isSuspendHovered ? 'var(--platform-danger)' : 'var(--platform-border-color)'}`,
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        <Ban size={18} />
                        Заблокувати (+1 страйк)
                    </Button>
                )}
            </div>
        </BaseDetailsPanel>
    );
};

export default SiteDetailsPanel;