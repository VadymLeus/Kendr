// frontend/src/modules/admin/components/UserDetailsPanel.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../../shared/ui/elements/Avatar';
import BaseDetailsPanel from './BaseDetailsPanel';
import { Button } from '../../../shared/ui/elements/Button';
import { Mail, Calendar, Layout, AlertTriangle, Smartphone, Hash, Globe, CheckCircle, Ban, AtSign } from 'lucide-react';

const UserDetailsPanel = ({ currentUser, user, onClose, onDelete, onSuspend, onRestore }) => {
    const navigate = useNavigate();
    const [isRestoreHovered, setIsRestoreHovered] = useState(false);
    const [isSuspendHovered, setIsSuspendHovered] = useState(false);
    const isStaff = user?.role === 'admin' || user?.role === 'moderator';
    const isProfileClickable = user?.status !== 'suspended' && !isStaff;
    const styles = useMemo(() => ({
        hero: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', position: 'relative' },
        section: { marginBottom: '28px' },
        sectionTitle: { fontSize: '12px', textTransform: 'uppercase', color: 'var(--platform-text-secondary)', marginBottom: '12px', fontWeight: '700', letterSpacing: '0.5px' },
        row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '14px' },
        rowLabel: { color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' },
        rowValue: { fontWeight: '500', color: 'var(--platform-text-primary)', textAlign: 'right' },
        statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
        statCard: { background: 'var(--platform-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--platform-border-color)', display: 'flex', flexDirection: 'column', gap: '8px' },
        avatarWrapper: { position: 'relative', cursor: isProfileClickable ? 'pointer' : 'default', transition: 'transform 0.2s' },
        bannedBanner: { background: 'var(--platform-danger-light, #fee2e2)', color: 'var(--platform-danger, #ef4444)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', border: '1px solid #fca5a5' }
    }), [user, isProfileClickable]);
    if (!user) return null;
    const canModify = currentUser?.role === 'admin' || (currentUser?.role === 'moderator' && user.role === 'user');
    const handleVisitProfile = () => {
        if (isProfileClickable) navigate(`/profile/${user.slug}`);
    };
    return (
        <BaseDetailsPanel 
            title="Деталі користувача" 
            onClose={onClose} 
            onDelete={() => onDelete(user.id)} 
            deleteLabel="Видалити повністю"
            deleteDisabled={!canModify}
            deleteTitle={!canModify ? "Недостатньо прав для видалення цього користувача" : ""}
        >
            {user.status === 'suspended' && (
                <div style={styles.bannedBanner}>
                    <Ban size={18} />
                    Акаунт заблоковано
                </div>
            )}
            <div style={styles.hero}>
                <div style={styles.avatarWrapper} onClick={handleVisitProfile} 
                     onMouseEnter={e => { if(isProfileClickable) e.currentTarget.style.transform = 'scale(1.05)' }}
                     onMouseLeave={e => { if(isProfileClickable) e.currentTarget.style.transform = 'scale(1)' }}
                >
                    <Avatar url={user.avatar_url} name={user.username} size={96} style={{ marginBottom: '16px', fontSize: '36px', border: '4px solid var(--platform-bg)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', filter: user.status === 'suspended' ? 'grayscale(100%)' : 'none' }} />
                    {user.is_verified && user.status !== 'suspended' && <div style={{position: 'absolute', bottom: '16px', right: '0', background: 'var(--platform-card-bg)', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}><CheckCircle size={20} color="var(--platform-success)" fill="var(--platform-card-bg)" /></div>}
                </div>
                <div onClick={handleVisitProfile} 
                     style={{
                        fontSize: '22px', 
                        fontWeight: 'bold', 
                        marginBottom: '4px', 
                        cursor: isProfileClickable ? 'pointer' : 'default', 
                        color: user.status === 'suspended' ? 'var(--platform-danger)' : 'var(--platform-text-primary)', 
                        transition: 'color 0.2s'
                     }}
                     onMouseEnter={e => { if(isProfileClickable) e.currentTarget.style.color = 'var(--platform-accent)' }}
                     onMouseLeave={e => { if(isProfileClickable) e.currentTarget.style.color = 'var(--platform-text-primary)' }}
                >
                    {user.username}
                </div>
                <div style={{fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: user.role === 'admin' ? 'var(--platform-danger)' : user.role === 'moderator' ? 'var(--platform-warning)' : 'var(--platform-text-secondary)', background: 'var(--platform-bg)', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--platform-border-color)', marginTop: '8px'}}>
                    {user.role === 'admin' ? 'Адміністратор' : user.role === 'moderator' ? 'Модератор' : 'Користувач'}
                </div>
            </div>
            <div style={styles.section}>
                <div style={styles.statGrid}>
                    <div style={styles.statCard}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--platform-text-secondary)', fontSize: '13px'}}><Layout size={16} /> Сайти</div>
                        <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--platform-text-primary)'}}>{user.status === 'suspended' ? 0 : (user.site_count || 0)}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--platform-text-secondary)', fontSize: '13px'}}><AlertTriangle size={16} /> Страйки</div>
                        <div style={{fontSize: '24px', fontWeight: 'bold', color: user.warning_count > 0 ? 'var(--platform-danger)' : 'var(--platform-text-primary)'}}>{user.warning_count || 0}</div>
                    </div>
                </div>
            </div>
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Контактна інформація</div>
                <div style={styles.row}>
                    <div style={styles.rowLabel}><Mail size={16}/> Email</div>
                    <div style={{...styles.rowValue, textDecoration: user.status === 'suspended' ? 'line-through' : 'none', opacity: user.status === 'suspended' ? 0.6 : 1}}>{user.email}</div>
                </div>
                {user.phone_number && <div style={styles.row}><div style={styles.rowLabel}><Smartphone size={16}/> Телефон</div><div style={styles.rowValue}>{user.phone_number}</div></div>}
                <div style={styles.row}>
                    <div style={styles.rowLabel}><AtSign size={16}/> Slug</div>
                    <div style={styles.rowValue}>/{user.slug || user.username}</div>
                </div>
                <div style={styles.row}><div style={styles.rowLabel}><Hash size={16}/> ID</div><div style={{...styles.rowValue, fontFamily: 'monospace', background: 'var(--platform-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--platform-border-color)'}}>{user.id}</div></div>
            </div>
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Метадані</div>
                <div style={styles.row}><div style={styles.rowLabel}><Calendar size={16}/> Реєстрація</div><div style={styles.rowValue}>{new Date(user.created_at).toLocaleString('uk-UA')}</div></div>
                {user.last_login_at && <div style={styles.row}><div style={styles.rowLabel}><Globe size={16}/> Останній вхід</div><div style={styles.rowValue}>{new Date(user.last_login_at).toLocaleString('uk-UA')}</div></div>}
            </div>
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--platform-border-color)' }}>
                {!canModify && (
                    <div style={{fontSize: '12px', color: 'var(--platform-warning)', textAlign: 'center', marginBottom: '12px'}}>
                        У вас немає прав для блокування чи відновлення цього користувача.
                    </div>
                )}
                {user.status !== 'suspended' ? (
                    <Button 
                        variant="outline" 
                        onClick={() => canModify && onSuspend(user.id)} 
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
                        Заблокувати акаунт
                    </Button>
                ) : (
                    <Button 
                        variant="outline" 
                        onClick={() => canModify && onRestore(user.id)} 
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
                        <CheckCircle size={18} />
                        Розблокувати акаунт
                    </Button>
                )}
            </div>
        </BaseDetailsPanel>
    );
};

export default UserDetailsPanel;