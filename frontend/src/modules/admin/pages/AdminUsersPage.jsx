// frontend/src/modules/admin/pages/AdminUsersPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import { toast } from 'react-toastify';
import AdminPageLayout from '../components/AdminPageLayout';
import UserDetailsPanel from '../components/UserDetailsPanel';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import apiClient from '../../../shared/api/api';
import { Users, Settings, Layout, AlertTriangle, Smartphone, CheckCircle } from 'lucide-react';

const AdminUsersPage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list');
    const [selectedUser, setSelectedUser] = useState(null);
    const { 
        filteredData: users, loading, searchQuery, setSearchQuery, refresh 
    } = useDataList('/admin/users', ['username', 'email', 'id']);

    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const handleDelete = (userId) => {
        requestConfirm({
            title: 'Видалити користувача?',
            message: 'Ця дія незворотна. Буде видалено акаунт та всі сайти.',
            type: 'danger',
            confirmLabel: 'Видалити',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/admin/users/${userId}`);
                    toast.success('Користувача видалено');
                    close();
                    setSelectedUser(null);
                    refresh();
                } catch (e) { 
                    console.error(e); 
                    toast.error('Помилка при видаленні');
                }
            }
        });
    };

    const handleVisitProfile = (e, username) => {
        e.stopPropagation();
        navigate(`/profile/${username}`);
    };

    const renderRoleBadge = (role) => {
        if (role === 'user') return null;
        const styles = role === 'admin' 
            ? { bg: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' } 
            : { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
        return (
            <div style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', background: styles.bg, color: styles.color, border: `1px solid ${styles.color}40` }}>
                {role}
            </div>
        );
    };

    const tableStyles = useMemo(() => ({
        card: { background: 'var(--platform-card-bg)', borderRadius: '16px', border: '1px solid var(--platform-border-color)', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%' },
        wrapper: { flex: 1, overflowY: 'auto', width: '100%' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '15px', tableLayout: 'fixed' },
        th: { textAlign: 'left', padding: '16px 20px', background: 'var(--platform-bg)', color: 'var(--platform-text-secondary)', fontWeight: '600', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--platform-border-color)', whiteSpace: 'nowrap' },
        td: { padding: '16px 20px', borderBottom: '1px solid var(--platform-border-color)', color: 'var(--platform-text-primary)', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        row: { cursor: 'pointer', transition: 'background 0.2s' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', overflowY: 'auto', paddingBottom: '20px', width: '100%' },
        cardItem: { background: 'var(--platform-card-bg)', borderRadius: '16px', border: '1px solid var(--platform-border-color)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s' }
    }), []);

    return (
        <AdminPageLayout 
            title="Користувачі" icon={Users} count={users.length} 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
            viewMode={viewMode} setViewMode={setViewMode} 
            onRefresh={refresh} loading={loading}
            searchPlaceholder="Пошук (ім'я, email, id)..."
        >
            {viewMode === 'list' ? (
                <div style={tableStyles.card}>
                    <div style={tableStyles.wrapper} className="custom-scrollbar">
                        <table style={tableStyles.table}>
                            <colgroup><col style={{width: '80px'}} /><col style={{width: '30%'}} /><col style={{width: '25%'}} /><col style={{width: '15%'}} /><col style={{width: '15%'}} /><col style={{width: '15%'}} /><col style={{width: '60px'}} /></colgroup>
                            <thead>
                                <tr>
                                    <th style={tableStyles.th}>ID</th>
                                    <th style={tableStyles.th}>Користувач</th>
                                    <th style={tableStyles.th}>Контакти</th>
                                    <th style={tableStyles.th}>Статус</th>
                                    <th style={tableStyles.th}>Ресурси</th>
                                    <th style={tableStyles.th}>Дата реєстрації</th>
                                    <th style={{...tableStyles.th, textAlign: 'right'}}>Дії</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan="7" style={{padding:'24px', textAlign:'center', opacity:0.5}}>Завантаження...</td></tr>) : 
                                users.length === 0 ? <tr><td colSpan="7" style={{padding:'40px', textAlign:'center', opacity:0.6}}>Користувачів не знайдено</td></tr> : 
                                users.map(user => (
                                    <tr key={user.id} onClick={() => setSelectedUser(user)} className="hover:bg-(--platform-bg)"
                                        style={{...tableStyles.row, background: selectedUser?.id === user.id ? 'var(--platform-bg)' : 'transparent', borderBottom: '1px solid var(--platform-border-color)'}}>
                                        <td style={{...tableStyles.td, opacity: 0.6}}>#{user.id}</td>
                                        <td style={tableStyles.td}>
                                            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                                <div onClick={(e) => handleVisitProfile(e, user.username)} className="hover:opacity-80" style={{cursor: 'pointer'}}>
                                                    <Avatar url={user.avatar_url} name={user.username} size={36} />
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                                    <div style={{fontWeight: '600'}}>{user.username}</div>
                                                    {user.is_verified && <div style={{fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px'}}><CheckCircle size={10}/> Verified</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tableStyles.td}>
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px'}}>
                                                <span>{user.email}</span>
                                                {user.phone_number && <span style={{color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px'}}><Smartphone size={10}/> {user.phone_number}</span>}
                                            </div>
                                        </td>
                                        <td style={tableStyles.td}>
                                            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                                {renderRoleBadge(user.role)}
                                                <span style={{fontSize: '12px', padding: '2px 6px', borderRadius: '4px', background: user.status === 'active' ? 'transparent' : 'rgba(239, 68, 68, 0.1)', color: user.status === 'active' ? 'var(--platform-text-secondary)' : '#ef4444'}}>
                                                    {user.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={tableStyles.td}>
                                            <div style={{display: 'flex', gap: '16px'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'}}><Layout size={14} color="var(--platform-text-secondary)" /> {user.site_count}</div>
                                                {user.warning_count > 0 && <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--platform-danger)'}}><AlertTriangle size={14} /> {user.warning_count}</div>}
                                            </div>
                                        </td>
                                        <td style={{...tableStyles.td, fontSize: '13px', color: 'var(--platform-text-secondary)'}}>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td style={{...tableStyles.td, textAlign: 'right', overflow: 'visible', padding: '0 12px'}}>
                                            <Button variant="ghost" style={{padding: '6px'}}>
                                                <Settings size={18} color="var(--platform-text-secondary)" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={tableStyles.grid} className="custom-scrollbar">
                    {loading ? <div>Завантаження...</div> : users.map(user => (
                        <div key={user.id} onClick={() => setSelectedUser(user)} className="hover:shadow-md hover:border-(--platform-border-color-hover)"
                            style={{...tableStyles.cardItem, borderColor: selectedUser?.id === user.id ? 'var(--platform-accent)' : 'var(--platform-border-color)'}}>
                            <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                {renderRoleBadge(user.role) || <div />}
                                <div style={{fontSize: '11px', color: 'var(--platform-text-secondary)'}}>#{user.id}</div>
                            </div>
                            <div onClick={(e) => handleVisitProfile(e, user.username)} className="hover:scale-105 transition-transform" style={{cursor: 'pointer'}}>
                                <Avatar url={user.avatar_url} name={user.username} size={72} />
                            </div>
                            <div style={{textAlign: 'center', width: '100%'}}>
                                <div style={{fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', gap: '4px'}}>{user.username} {user.is_verified && <CheckCircle size={14} color="#10b981" />}</div>
                                <div style={{fontSize: '13px', color: 'var(--platform-text-secondary)'}}>{user.email}</div>
                            </div>
                            <div style={{width: '100%', height: '1px', background: 'var(--platform-border-color)'}}></div>
                            <div style={{width: '100%', display: 'flex', justifyContent: 'space-around'}}>
                                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><span style={{fontSize: '12px', color: 'var(--platform-text-secondary)'}}>Сайти</span><span style={{fontWeight: 'bold'}}>{user.site_count}</span></div>
                                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><span style={{fontSize: '12px', color: 'var(--platform-text-secondary)'}}>Страйки</span><span style={{fontWeight: 'bold', color: user.warning_count > 0 ? 'var(--platform-danger)' : 'inherit'}}>{user.warning_count}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <UserDetailsPanel user={selectedUser} onClose={() => setSelectedUser(null)} onDelete={handleDelete} />
            <ConfirmModal isOpen={isOpen} title={config.title} message={config.message} confirmLabel={config.confirmLabel} cancelLabel={config.cancelLabel} type={config.type} onConfirm={config.onConfirm} onCancel={close} />
        </AdminPageLayout>
    );
};

export default AdminUsersPage;