// frontend/src/modules/admin/pages/AdminUsersPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import AdminPageLayout from '../components/AdminPageLayout';
import UserDetailsPanel from '../components/UserDetailsPanel';
import { Input } from '../../../shared/ui/elements/Input';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar, CsvExportButton } from '../components/AdminTableComponents';
import apiClient, { suspendUser, restoreUser } from '../../../shared/api/api';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { exportToCsv } from '../../../shared/utils/exportToCsv';
import { Users, Settings, Layout, AlertTriangle, Smartphone, CheckCircle, Search, Ban } from 'lucide-react';

const AdminUsersPage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list');
    const [selectedUser, setSelectedUser] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const { filteredData: rawUsers, loading, searchQuery, setSearchQuery, refresh } = useDataList('/admin/users', ['username', 'email', 'id']);
    const { confirm } = useConfirm();
    const processedUsers = useMemo(() => {
        let res = [...rawUsers];
        return res.sort((a, b) => (a[sortConfig.key] < b[sortConfig.key] ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1));
    }, [rawUsers, sortConfig]);
    const handleSort = (key) => setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));
    const handleDelete = (userId) => {
        confirm({ 
            title: 'Видалити акаунт?', 
            message: 'Ця дія незворотна. Всі дані будуть видалені. Введіть "DELETE" для підтвердження.', 
            requireInput: true,
            expectedInput: 'DELETE',
            confirmText: 'Видалити повністю', 
            danger: true,
            onConfirm: async (inputValue) => { 
                if (inputValue !== 'DELETE') return toast.error('Невірне підтвердження.');
                try { 
                    await apiClient.delete(`/admin/users/${userId}`); 
                    toast.success('Користувача видалено'); 
                    setSelectedUser(null); 
                    refresh(); 
                } catch { toast.error('Помилка видалення'); } 
            } 
        });
    };

    const handleSuspend = (userId) => {
        confirm({ 
            title: 'Забанити назавжди?', 
            message: 'Пошта залишиться в блеклісті, але сайти, медіафайли та персональні дані будуть незворотно стерті. Введіть "SUSPEND" для підтвердження.', 
            requireInput: true,
            expectedInput: 'SUSPEND',
            confirmText: 'Забанити', 
            danger: true,
            onConfirm: async (inputValue) => { 
                if (inputValue !== 'SUSPEND') return toast.error('Невірне підтвердження.');
                try { 
                    await suspendUser(userId); 
                    toast.success('Користувача забанено'); 
                    setSelectedUser(null); 
                    refresh(); 
                } catch (error) { toast.error(error.response?.data?.message || 'Помилка бану'); } 
            } 
        });
    };

    const handleRestore = (userId) => {
        confirm({ 
            title: 'Розблокувати акаунт?', 
            message: 'Користувач знову зможе користуватися платформою. Старі сайти не відновляться, але він зможе створити нові. Введіть "RESTORE" для підтвердження.', 
            requireInput: true,
            expectedInput: 'RESTORE',
            confirmText: 'Розблокувати',
            onConfirm: async (inputValue) => { 
                if (inputValue !== 'RESTORE') return toast.error('Невірне підтвердження.');
                try { 
                    await restoreUser(userId); 
                    toast.success('Користувача розблоковано'); 
                    setSelectedUser(null); 
                    refresh(); 
                } catch (error) { toast.error(error.response?.data?.message || 'Помилка розблокування'); } 
            } 
        });
    };

    const handleExport = () => {
        if (!processedUsers?.length) return toast.info('Немає даних');
        exportToCsv(processedUsers.map(u => ({
            id: u.id, username: u.username, email: u.email, phone: u.phone_number || '-', role: u.role || 'user', status: u.status,
            is_verified: u.is_verified ? 'Так' : 'Ні', sites: u.site_count || 0, warnings: u.warning_count || 0, created: new Date(u.created_at).toLocaleString('uk-UA')
        })), { id: 'ID', username: "Ім'я", email: 'Email', phone: 'Телефон', role: 'Роль', status: 'Статус', is_verified: 'Верифікований', sites: 'Сайти', warnings: 'Страйки', created: 'Дата' }, `users_${new Date().toLocaleDateString('uk-UA')}`);
    };
    return (
        <AdminPageLayout title="Користувачі" icon={Users} count={processedUsers.length} viewMode={viewMode} setViewMode={setViewMode} onRefresh={refresh} loading={loading}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar />
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '300px' }}><Input placeholder="Пошук..." leftIcon={<Search size={16}/>} value={searchQuery || ''} onChange={(e) => setSearchQuery(e.target.value)} wrapperStyle={{margin: 0}} /></div>
                    <CsvExportButton onClick={handleExport} disabled={loading || !processedUsers.length} />
                </div>
            </div>
            {viewMode === 'list' ? (
                <AdminTable>
                    <colgroup><col style={{width: '80px'}} /><col style={{width: '35%'}} /><col style={{width: '25%'}} /><col style={{width: '15%'}} /><col style={{width: '15%'}} /><col style={{width: '60px'}} /></colgroup>
                    <thead><tr><AdminTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Користувач" sortKey="username" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Контакти" sortKey="email" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Ресурси" sortKey="site_count" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Дата реєстрації" sortKey="created_at" currentSort={sortConfig} onSort={handleSort} /><AdminTh label="Дії" align="right" /></tr></thead>
                    <tbody>
                        {loading ? <LoadingRow cols={6} /> : !processedUsers.length ? <EmptyRow cols={6} /> : processedUsers.map(u => (
                            <AdminRow key={u.id} onClick={() => setSelectedUser(u)} isSelected={selectedUser?.id === u.id}>
                                <AdminCell style={{opacity: 0.6}}>#{u.id}</AdminCell>
                                <AdminCell>
                                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                        <div onClick={(e)=>{e.stopPropagation(); if(u.status !== 'suspended') navigate(`/profile/${u.username}`)}} className="hover:opacity-80 cursor-pointer">
                                            <Avatar url={u.avatar_url} name={u.username} size={36} />
                                        </div>
                                        <div>
                                            <div style={{fontWeight: '600', color: u.status === 'suspended' ? 'var(--platform-danger)' : 'inherit'}}>
                                                {u.username}
                                                {u.status === 'suspended' && <span style={{marginLeft: '8px', fontSize: '10px', background: 'var(--platform-danger)', color: 'white', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', fontWeight: 'bold'}}>BANNED</span>}
                                            </div>
                                            {u.is_verified && u.status !== 'suspended' && <div style={{fontSize: '11px', color: 'var(--platform-success)', display: 'flex', alignItems: 'center', gap: '3px'}}><CheckCircle size={10}/> Verified</div>}
                                        </div>
                                    </div>
                                </AdminCell>
                                <AdminCell><div style={{fontSize: '13px'}}><div style={{textDecoration: u.status === 'suspended' ? 'line-through' : 'none', opacity: u.status === 'suspended' ? 0.5 : 1}}>{u.email}</div>{u.phone_number && <div style={{color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px'}}><Smartphone size={10}/> {u.phone_number}</div>}</div></AdminCell>
                                <AdminCell><div style={{display: 'flex', gap: '16px'}}><div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'}}><Layout size={14} color="var(--platform-text-secondary)" /> {u.status === 'suspended' ? 0 : u.site_count}</div>{u.warning_count > 0 && <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--platform-danger)'}}><AlertTriangle size={14} /> {u.warning_count}</div>}</div></AdminCell>
                                <AdminCell style={{fontSize: '13px', color: 'var(--platform-text-secondary)'}}>{new Date(u.created_at).toLocaleDateString()}</AdminCell>
                                <AdminCell align="right" style={{overflow: 'visible'}}><Button variant="ghost" style={{padding: '6px'}}><Settings size={18} color="var(--platform-text-secondary)" /></Button></AdminCell>
                            </AdminRow>
                        ))}
                    </tbody>
                </AdminTable>
            ) : <div style={{ padding: '40px', textAlign: 'center', color: 'var(--platform-text-secondary)' }}>Режим сітки в розробці</div>}
            <UserDetailsPanel 
                user={selectedUser} 
                onClose={() => setSelectedUser(null)} 
                onDelete={handleDelete} 
                onSuspend={handleSuspend}
                onRestore={handleRestore}
            />
        </AdminPageLayout>
    );
};
export default AdminUsersPage;