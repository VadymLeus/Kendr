// frontend/src/modules/admin/components/SiteDetailsPanel.jsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import BaseDetailsPanel from './BaseDetailsPanel';
import { Mail, Calendar, Layout, AlertTriangle, UserCheck, Ban, Shield, Smartphone, Hash, Globe, CheckCircle, ExternalLink, X, Trash } from 'lucide-react';

const UserDetailsPanel = ({ user, onClose, onDelete }) => {
    const navigate = useNavigate();
    const styles = useMemo(() => ({
        hero: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px', position: 'relative' },
        section: { marginBottom: '28px' },
        sectionTitle: { fontSize: '12px', textTransform: 'uppercase', color: 'var(--platform-text-secondary)', marginBottom: '12px', fontWeight: '700', letterSpacing: '0.5px' },
        row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '14px' },
        rowLabel: { color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' },
        rowValue: { fontWeight: '500', color: 'var(--platform-text-primary)', textAlign: 'right' },
        statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
        statCard: { background: 'var(--platform-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--platform-border-color)', display: 'flex', flexDirection: 'column', gap: '8px' },
        avatarWrapper: { position: 'relative', cursor: 'pointer', transition: 'transform 0.2s' }
    }), []);
    if (!user) return null;

    const handleVisitProfile = () => navigate(`/profile/${user.username}`);

    return (
        <BaseDetailsPanel 
            title="Деталі користувача" 
            onClose={onClose} 
            onDelete={() => onDelete(user.id)}
            deleteLabel="Видалити користувача"
        >
            <div style={styles.hero}>
                <div style={styles.avatarWrapper} onClick={handleVisitProfile} className="group hover:scale-105">
                    <Avatar url={user.avatar_url} name={user.username} size={96} style={{ marginBottom: '16px', fontSize: '36px', border: '4px solid var(--platform-bg)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    {user.is_verified && <div style={{position: 'absolute', bottom: '16px', right: '0', background: 'var(--platform-card-bg)', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}><CheckCircle size={20} color="#10b981" fill="var(--platform-card-bg)" /></div>}
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-1 text-white"><ExternalLink size={16} /></div>
                </div>
                <div onClick={handleVisitProfile} style={{fontSize: '22px', fontWeight: 'bold', marginBottom: '4px', cursor: 'pointer'}} className="hover:text-(--platform-accent) transition-colors">{user.username}</div>
                <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                    <div style={{padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: 'var(--platform-bg)', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--platform-border-color)'}}>{user.role === 'admin' && <Shield size={12}/>} {user.role}</div>
                    <div style={{padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: user.status === 'banned' ? '#fee2e2' : '#dcfce7', color: user.status === 'banned' ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px'}}>{user.status === 'banned' ? <Ban size={12}/> : <UserCheck size={12}/>} {user.status}</div>
                </div>
            </div>

            <div style={styles.section}>
                <div style={styles.statGrid}>
                    <div style={styles.statCard}><div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--platform-text-secondary)', fontSize: '13px'}}><Layout size={16} /> Сайти</div><div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--platform-text-primary)'}}>{user.site_count || 0}</div></div>
                    <div style={styles.statCard}><div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--platform-text-secondary)', fontSize: '13px'}}><AlertTriangle size={16} /> Страйки</div><div style={{fontSize: '24px', fontWeight: 'bold', color: user.warning_count > 0 ? 'var(--platform-danger)' : 'var(--platform-text-primary)'}}>{user.warning_count || 0}</div></div>
                </div>
            </div>

            <div style={styles.section}>
                <div style={styles.sectionTitle}>Контактна інформація</div>
                <div style={styles.row}><div style={styles.rowLabel}><Mail size={16}/> Email</div><div style={styles.rowValue}>{user.email}</div></div>
                {user.phone_number && <div style={styles.row}><div style={styles.rowLabel}><Smartphone size={16}/> Телефон</div><div style={styles.rowValue}>{user.phone_number}</div></div>}
                <div style={styles.row}><div style={styles.rowLabel}><Hash size={16}/> ID</div><div style={{...styles.rowValue, fontFamily: 'monospace', background: 'var(--platform-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--platform-border-color)'}}>{user.id}</div></div>
            </div>

            <div style={styles.section}>
                <div style={styles.sectionTitle}>Метадані</div>
                <div style={styles.row}><div style={styles.rowLabel}><Calendar size={16}/> Реєстрація</div><div style={styles.rowValue}>{new Date(user.created_at).toLocaleString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
                {user.last_login_at && <div style={styles.row}><div style={styles.rowLabel}><Globe size={16}/> Останній вхід</div><div style={styles.rowValue}>{new Date(user.last_login_at).toLocaleString('uk-UA')}</div></div>}
            </div>
        </BaseDetailsPanel>
    );
};

export default UserDetailsPanel;