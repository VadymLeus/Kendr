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

const SiteDetailsPanel = ({ currentUser, site, onClose, actions }) => {
    const navigate = useNavigate();
    const [isSuspendHovered, setIsSuspendHovered] = useState(false);
    const [isRestoreHovered, setIsRestoreHovered] = useState(false);
    const [isProbationHovered, setIsProbationHovered] = useState(false);
    const statusConfig = {
        published: { bg: 'rgba(56, 161, 105, 0.1)', color: '#38a169', label: 'Активний', icon: CheckCircle },
        suspended: { bg: 'rgba(229, 62, 62, 0.1)', color: '#e53e3e', label: 'Заблоковано', icon: Ban },
        probation: { bg: 'rgba(214, 158, 46, 0.1)', color: '#d69e2e', label: 'Модерація', icon: ShieldAlert },
        maintenance: { bg: 'rgba(214, 158, 46, 0.1)', color: '#d69e2e', label: 'Тех. роботи', icon: Clock },
        private: { bg: 'rgba(128, 90, 213, 0.1)', color: '#805ad5', label: 'Приват', icon: Clock }
    };
    const safeStatusKey = site?.status || 'maintenance';
    const currentStatus = statusConfig[safeStatusKey] || statusConfig.maintenance;
    const StatusIcon = currentStatus.icon;
    const isStaffAuthor = site?.owner_role === 'admin' || site?.owner_role === 'moderator';
    const isAuthorClickable = !isStaffAuthor;
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
    const canModify = currentUser?.role === 'admin' || (currentUser?.role === 'moderator' && site.owner_role === 'user');
    const isSuspended = site.status === 'suspended';
    const isProbation = site.status === 'probation';
    const { expired: isExpired, text: timeLeftString } = calculateTimeLeft(site.deletion_scheduled_for);
    const siteReason = site.suspension_reason || site.reason;
    const handleVisitProfile = () => {
        if (isAuthorClickable) {
            const targetIdentifier = site.author_slug || site.author;
            navigate(`/profile/${targetIdentifier}`);
        }
    };
    
    return (
        <BaseDetailsPanel 
            title="Керування сайтом" 
            onClose={onClose} 
            onDelete={() => actions.delete(site.site_path)}
            deleteTitle={!canModify ? "Недостатньо прав" : (isSuspended && (!isExpired && site.appeal_status === 'pending') ? "Спочатку розгляньте апеляцію" : "Видалити назавжди")}
            deleteDisabled={!canModify || (isSuspended && !isExpired && site.appeal_status === 'pending')}
            deleteLabel="Видалити остаточно"
        >
            <div style={styles.section}>
                <div style={styles.label}>Сайт</div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', marginBottom: '16px'}}>
                    <Avatar url={site.logo_url} name={site.title} size={42} />
                    <div style={{minWidth: 0}}>
                        <div style={{...styles.value, fontSize: '18px', fontWeight: 'bold'}} className="truncate">{site.title}</div>
                        <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all'}}>/{site.site_path}</div>
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
                <div style={styles.label}>Статистика</div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <div style={{ background: 'var(--platform-bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--platform-border-color)', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <Eye size={20} color="var(--platform-text-secondary)" />
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--platform-text-secondary)' }}>Перегляди сайту</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--platform-text-primary)' }}>{site.view_count || 0}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={styles.section}>
                <div style={styles.label}>Власник</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div 
                        onClick={handleVisitProfile} 
                        style={{ cursor: isAuthorClickable ? 'pointer' : 'default', transition: 'transform 0.2s', flexShrink: 0 }}
                        onMouseEnter={e => { if(isAuthorClickable) e.currentTarget.style.transform = 'scale(1.05)' }}
                        onMouseLeave={e => { if(isAuthorClickable) e.currentTarget.style.transform = 'scale(1)' }}
                    >
                        <Avatar url={site.author_avatar_url} name={site.author} size={42} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div 
                            onClick={handleVisitProfile}
                            style={{
                                ...styles.value, 
                                cursor: isAuthorClickable ? 'pointer' : 'default', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                transition: 'color 0.2s',
                                fontWeight: 'bold'
                            }}
                            onMouseEnter={e => { if(isAuthorClickable) e.currentTarget.style.color = 'var(--platform-accent)' }}
                            onMouseLeave={e => { if(isAuthorClickable) e.currentTarget.style.color = 'var(--platform-text-primary)' }}
                            title={isAuthorClickable ? "Відкрити профіль користувача" : ""}
                        >
                            <span className="truncate">{site.author}</span>
                            {site.owner_role === 'admin' && <span style={{color:'var(--platform-danger)', fontSize: '12px'}}>(Адмін)</span>}
                            {site.owner_role === 'moderator' && <span style={{color:'var(--platform-warning)', fontSize: '12px'}}>(Модератор)</span>}
                            {isAuthorClickable && <ExternalLink size={14} style={{ opacity: 0.5, flexShrink: 0 }} />}
                        </div>
                        <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)', opacity: 0.8, wordBreak: 'break-all'}}>{site.author_email}</div>
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
                    <Clock size={20} style={{ shrink: 0, marginTop: '2px' }} />
                    <div style={{ width: '100%', minWidth: 0 }}>
                        <div style={{fontWeight: 'bold', marginBottom: '4px'}}>Сайт призупинено</div>
                        <div style={{fontSize: '13px'}}>До видалення: <strong>{timeLeftString}</strong></div>
                        {siteReason && (
                            <div style={{
                                marginTop: '12px', 
                                padding: '10px 12px', 
                                backgroundColor: 'color-mix(in srgb, var(--platform-danger), transparent 85%)', 
                                borderRadius: '8px',
                                border: '1px solid color-mix(in srgb, var(--platform-danger), transparent 75%)',
                                fontSize: '13px',
                                color: 'var(--platform-danger)'
                            }}>
                                <strong style={{display: 'block', marginBottom: '4px'}}>Причина блокування:</strong>
                                <span style={{opacity: 0.9, lineHeight: '1.4', wordBreak: 'break-word'}}>{siteReason}</span>
                            </div>
                        )}
                        {isExpired && <div style={{fontSize: '13px', marginTop: '8px', fontWeight: 'bold'}}>Можна видаляти.</div>}
                    </div>
                </div>
            )}
            {isProbation && (
                <div style={styles.infoBox('warning')}>
                    <Eye size={20} className="shrink-0" />
                    <div>
                        <div style={{fontWeight: 'bold', marginBottom: '4px'}}>Випробувальний термін</div>
                        <div style={{fontSize: '13px'}}>Доступ для редагування відкрито, публікація закрита.</div>
                    </div>
                </div>
            )}
            {site.appeal_status === 'pending' && (
                <div style={styles.infoBox('info')}>
                    <ShieldCheck size={20} className="shrink-0" />
                    <div>
                        <div style={{fontWeight: 'bold', marginBottom: '4px'}}>Є активна апеляція</div>
                        <div style={{fontSize: '13px'}}>Дата: {new Date(site.appeal_date).toLocaleDateString()}</div>
                    </div>
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', borderTop: '1px solid var(--platform-border-color)', paddingTop: '24px' }}>
                 {!canModify && (
                     <div style={{fontSize: '12px', color: 'var(--platform-warning)', textAlign: 'center', marginBottom: '4px'}}>
                         У вас немає прав для блокування чи відновлення цього сайту.
                     </div>
                 )}
                 {(isSuspended || isProbation) ? (
                    <>
                        <Button 
                            variant="outline" 
                            onClick={() => canModify && actions.restore(site.site_path)} 
                            onMouseEnter={() => canModify && setIsRestoreHovered(true)}
                            onMouseLeave={() => canModify && setIsRestoreHovered(false)}
                            disabled={!canModify}
                            style={{ 
                                width: '100%', 
                                display: 'flex', 
                                justifyContent: 'center', 
                                gap: '8px', 
                                background: 'transparent', 
                                color: isRestoreHovered && canModify ? 'var(--platform-success)' : 'var(--platform-text-primary)', 
                                border: `1px solid ${isRestoreHovered && canModify ? 'var(--platform-success)' : 'var(--platform-border-color)'}`,
                                transition: 'all 0.2s ease-in-out',
                                opacity: canModify ? 1 : 0.5
                            }}
                        >
                            <RefreshCw size={18} />
                            Відновити
                        </Button>
                        {isSuspended && (
                            <Button 
                                variant="outline" 
                                onClick={() => canModify && actions.probation(site.site_path)} 
                                onMouseEnter={() => canModify && setIsProbationHovered(true)}
                                onMouseLeave={() => canModify && setIsProbationHovered(false)}
                                disabled={!canModify}
                                style={{ 
                                    width: '100%', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    gap: '8px', 
                                    background: 'transparent', 
                                    color: isProbationHovered && canModify ? 'var(--platform-warning)' : 'var(--platform-text-primary)', 
                                    border: `1px solid ${isProbationHovered && canModify ? 'var(--platform-warning)' : 'var(--platform-border-color)'}`,
                                    transition: 'all 0.2s ease-in-out',
                                    opacity: canModify ? 1 : 0.5
                                }}
                            >
                                <FileEdit size={18} />
                                Надати доступ до редагування
                            </Button>
                        )}
                    </>
                ) : (
                    <Button 
                        variant="outline" 
                        onClick={() => canModify && actions.suspend(site.site_path)} 
                        onMouseEnter={() => canModify && setIsSuspendHovered(true)}
                        onMouseLeave={() => canModify && setIsSuspendHovered(false)}
                        disabled={!canModify}
                        style={{ 
                            width: '100%', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '8px', 
                            background: 'transparent', 
                            color: isSuspendHovered && canModify ? 'var(--platform-danger)' : 'var(--platform-text-primary)', 
                            border: `1px solid ${isSuspendHovered && canModify ? 'var(--platform-danger)' : 'var(--platform-border-color)'}`,
                            transition: 'all 0.2s ease-in-out',
                            opacity: canModify ? 1 : 0.5
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