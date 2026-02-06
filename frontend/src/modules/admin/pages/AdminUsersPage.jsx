// frontend/src/modules/admin/pages/AdminUsersPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../../shared/ui/elements/Button';
import Avatar from '../../../shared/ui/elements/Avatar';
import AdminPageLayout from '../components/AdminPageLayout';
import UserDetailsPanel from '../components/UserDetailsPanel';
import ConfirmModal from '../../../shared/ui/complex/ConfirmModal';
import { Input } from '../../../shared/ui/elements/Input';
import { AdminTable, AdminTh, AdminRow, AdminCell, LoadingRow, EmptyRow, FilterBar } from '../components/AdminTableComponents';
import apiClient from '../../../shared/api/api';
import { useDataList } from '../../../shared/hooks/useDataList';
import { useConfirmDialog } from '../../../shared/hooks/useConfirmDialog';
import { Users, Settings, Layout, AlertTriangle, Smartphone, CheckCircle, Search } from 'lucide-react';

const AdminUsersPage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('list');
    const [selectedUser, setSelectedUser] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const { filteredData: rawUsers, loading, searchQuery, setSearchQuery, refresh } = useDataList('/admin/users', ['username', 'email', 'id']);
    const { isOpen, config, requestConfirm, close } = useConfirmDialog();
    const processedUsers = useMemo(() => {
        let result = [...rawUsers];
        result.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [rawUsers, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(curr => ({ key, direction: curr.key === key && curr.direction === 'desc' ? 'asc' : 'desc' }));
    };

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
                } catch (e) { toast.error('Помилка при видаленні'); }
            }
        });
    };

    return (
        <AdminPageLayout 
            title="Користувачі" icon={Users} count={processedUsers.length} 
            viewMode={viewMode} setViewMode={setViewMode} 
            onRefresh={refresh} loading={loading}
        >
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <FilterBar>
                </FilterBar>

                <div style={{ width: '300px' }}>
                    <Input 
                        placeholder="Пошук (ім'я, email, ID)..."
                        leftIcon={<Search size={16}/>}
                        value={searchQuery || ''} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        wrapperStyle={{margin: 0}}
                    />
                </div>
            </div>

            {viewMode === 'list' ? (
                <AdminTable>
                    <colgroup>
                        <col style={{width: '80px'}} />
                        <col style={{width: '35%'}} />
                        <col style={{width: '25%'}} />
                        <col style={{width: '15%'}} />
                        <col style={{width: '15%'}} />
                        <col style={{width: '60px'}} />
                    </colgroup>
                    <thead>
                        <tr>
                            <AdminTh label="ID" sortKey="id" currentSort={sortConfig} onSort={handleSort} />
                            <AdminTh label="Користувач" sortKey="username" currentSort={sortConfig} onSort={handleSort} />
                            <AdminTh label="Контакти" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                            <AdminTh label="Ресурси" sortKey="site_count" currentSort={sortConfig} onSort={handleSort} />
                            <AdminTh label="Дата реєстрації" sortKey="created_at" currentSort={sortConfig} onSort={handleSort} />
                            <AdminTh label="Дії" align="right" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <LoadingRow cols={6} />
                        ) : processedUsers.length === 0 ? (
                            <EmptyRow cols={6} message="Користувачів не знайдено" />
                        ) : (
                            processedUsers.map(user => (
                                <AdminRow key={user.id} onClick={() => setSelectedUser(user)} isSelected={selectedUser?.id === user.id}>
                                    <AdminCell style={{opacity: 0.6}}>#{user.id}</AdminCell>
                                    
                                    <AdminCell>
                                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                            <div onClick={(e) => { e.stopPropagation(); navigate(`/profile/${user.username}`); }} className="hover:opacity-80 cursor-pointer">
                                                <Avatar url={user.avatar_url} name={user.username} size={36} />
                                            </div>
                                            <div>
                                                <div style={{fontWeight: '600'}}>{user.username}</div>
                                                {user.is_verified && <div style={{fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px'}}><CheckCircle size={10}/> Verified</div>}
                                            </div>
                                        </div>
                                    </AdminCell>

                                    <AdminCell>
                                        <div style={{fontSize: '13px'}}>
                                            <div>{user.email}</div>
                                            {user.phone_number && <div style={{color: 'var(--platform-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px'}}><Smartphone size={10}/> {user.phone_number}</div>}
                                        </div>
                                    </AdminCell>

                                    <AdminCell>
                                        <div style={{display: 'flex', gap: '16px'}}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'}}><Layout size={14} color="var(--platform-text-secondary)" /> {user.site_count}</div>
                                            {user.warning_count > 0 && <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--platform-danger)'}}><AlertTriangle size={14} /> {user.warning_count}</div>}
                                        </div>
                                    </AdminCell>

                                    <AdminCell style={{fontSize: '13px', color: 'var(--platform-text-secondary)'}}>{new Date(user.created_at).toLocaleDateString()}</AdminCell>
                                    
                                    <AdminCell align="right" style={{overflow: 'visible'}}>
                                        <Button variant="ghost" style={{padding: '6px'}}><Settings size={18} color="var(--platform-text-secondary)" /></Button>
                                    </AdminCell>
                                </AdminRow>
                            ))
                        )}
                    </tbody>
                </AdminTable>
            ) : (
                 <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 4px 20px 0' }}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'}}>
                         <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--platform-text-secondary)' }}>
                            Режим сітки в розробці
                         </div>
                    </div>
                 </div>
            )}

            <UserDetailsPanel user={selectedUser} onClose={() => setSelectedUser(null)} onDelete={handleDelete} />
            <ConfirmModal isOpen={isOpen} {...config} onCancel={close} />
        </AdminPageLayout>
    );
};

export default AdminUsersPage;