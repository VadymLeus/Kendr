// frontend/src/modules/dashboard/features/settings/components/TeamSettingsSection.jsx
import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../../../../shared/api/api';
import { Button, Input, Switch } from '../../../../../shared/ui/elements';
import Avatar from '../../../../../shared/ui/elements/Avatar';
import ConfirmModal from '../../../../../shared/ui/complex/ConfirmModal';
import { AuthContext } from '../../../../../app/providers/AuthContext';
import { Users, Link as LinkIcon, ArrowRightLeft, UserMinus, ShieldAlert, Loader, Trash, RefreshCw, Settings, Edit, Palette, ShoppingBag, BarChart2 } from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
    { key: 'editor', text: 'Редактор', icon: Edit },
    { key: 'theme', text: 'Стилі', icon: Palette },
    { key: 'commerce', text: 'Комерція', icon: ShoppingBag },
    { key: 'overview', text: 'Огляд', icon: BarChart2 },
    { key: 'settings', text: 'Загальні', icon: Settings }
];

const TeamSettingsSection = ({ siteData, isAdmin, isLocked }) => {
    const { user } = useContext(AuthContext);
    const [collaborators, setCollaborators] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteLink, setInviteLink] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [transferEmail, setTransferEmail] = useState('');
    const [transferPassword, setTransferPassword] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);
    const [removeModalConfig, setRemoveModalConfig] = useState({ isOpen: false, userId: null });
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [permissionsModal, setPermissionsModal] = useState({ isOpen: false, targetUser: null, currentPermissions: [] });
    const [isSavingPermissions, setIsSavingPermissions] = useState(false);
    const isOwner = user?.id === siteData?.user_id;
    useEffect(() => {
        if (!siteData?.id) return;
        fetchCollaborators();
        if (isOwner) fetchActiveInvite();
    }, [siteData]);

    const fetchCollaborators = async () => {
        try {
            const res = await apiClient.get(`/team/${siteData.id}/collaborators`);
            setCollaborators(res.data);
        } catch (error) {
            console.error('Помилка завантаження команди:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActiveInvite = async () => {
        try {
            const res = await apiClient.get(`/team/${siteData.id}/invite`);
            if (res.data.inviteLink) {
                setInviteLink(res.data.inviteLink);
            }
        } catch (error) {
            console.error('Помилка завантаження активного посилання:', error);
        }
    };

    const handleGenerateInvite = async () => {
        setIsGenerating(true);
        try {
            const res = await apiClient.post(`/team/${siteData.id}/invite`);
            setInviteLink(res.data.inviteLink);
            toast.success('Нове посилання згенеровано! Воно дійсне 48 годин.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка генерації');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteInvite = async () => {
        try {
            await apiClient.delete(`/team/${siteData.id}/invite`);
            setInviteLink('');
            toast.success('Посилання видалено. Більше за ним ніхто не зможе приєднатися.');
        } catch (error) {
            toast.error('Помилка видалення посилання');
        }
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
        toast.info('Посилання скопійовано в буфер обміну');
    };

    const promptRemoveCollaborator = (userId) => {
        setRemoveModalConfig({ isOpen: true, userId });
    };

    const executeRemoveCollaborator = async () => {
        const userId = removeModalConfig.userId;
        setRemoveModalConfig({ isOpen: false, userId: null });
        if (!userId) return;
        try {
            await apiClient.delete(`/team/${siteData.id}/collaborators/${userId}`);
            toast.success(userId === user?.id ? 'Ви успішно покинули проєкт' : 'Користувача видалено з команди');
            if (userId === user?.id) {
                window.location.href = '/my-sites';
            } else {
                fetchCollaborators();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка видалення');
        }
    };

    const openPermissionsModal = (collab) => {
        setPermissionsModal({
            isOpen: true,
            targetUser: collab,
            currentPermissions: collab.permissions || []
        });
    };

    const togglePermission = (key) => {
        setPermissionsModal(prev => {
            const hasPerm = prev.currentPermissions.includes(key);
            return {
                ...prev,
                currentPermissions: hasPerm 
                    ? prev.currentPermissions.filter(p => p !== key)
                    : [...prev.currentPermissions, key]
            };
        });
    };

    const savePermissions = async () => {
        setIsSavingPermissions(true);
        try {
            await apiClient.put(`/team/${siteData.id}/collaborators/${permissionsModal.targetUser.id}/permissions`, {
                permissions: permissionsModal.currentPermissions
            });
            toast.success('Права доступу успішно оновлено!');
            setPermissionsModal({ isOpen: false, targetUser: null, currentPermissions: [] });
            fetchCollaborators();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка збереження прав');
        } finally {
            setIsSavingPermissions(false);
        }
    };

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        setIsTransferring(true);
        try {
            await apiClient.post(`/team/${siteData.id}/transfer/verify`, {
                newOwnerEmail: transferEmail,
                password: transferPassword
            }, { suppressToast: true });
            
            setIsTransferModalOpen(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка перевірки даних');
        } finally {
            setIsTransferring(false);
        }
    };

    const executeTransferOwnership = async () => {
        setIsTransferModalOpen(false);
        setIsTransferring(true);
        try {
            await apiClient.post(`/team/${siteData.id}/transfer`, { 
                newOwnerEmail: transferEmail, 
                password: transferPassword 
            }, { suppressToast: true });
            toast.success('Сайт успішно передано!');
            setTimeout(() => {
                window.location.href = '/my-sites';
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка передачі сайту');
        } finally {
            setIsTransferring(false);
        }
    };

    if (isAdmin || isLocked) return null;
    const isLeaving = removeModalConfig.userId === user?.id;
    return (
        <>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-5 sm:p-8 shadow-sm relative z-0">
                <div className="mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                        <Users size={20} className="text-(--platform-accent)" /> Командний доступ
                    </h3>
                    <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                        Спільна робота над сайтом
                    </p>
                </div>
                {isOwner && (
                    <div className="mb-8 p-4 bg-(--platform-bg) rounded-xl border border-(--platform-border-color)">
                        <p className="text-sm text-(--platform-text-primary) font-medium mb-3">Запросити користувача</p>
                        {!inviteLink ? (
                            <Button 
                                onClick={handleGenerateInvite} 
                                disabled={isGenerating}
                                variant="outline"
                                className="w-full sm:w-auto flex gap-2 items-center justify-center"
                            >
                                {isGenerating ? <Loader size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                                Згенерувати запрошення
                            </Button>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input 
                                    value={inviteLink} 
                                    readOnly 
                                    className="flex-1 mb-0!" 
                                    style={{ margin: 0 }}
                                />
                                <Button onClick={copyInviteLink} className="shrink-0 flex gap-2 items-center justify-center">
                                    <LinkIcon size={16} /> Копіювати
                                </Button>
                                <Button 
                                    onClick={handleGenerateInvite} 
                                    disabled={isGenerating} 
                                    variant="outline" 
                                    className="shrink-0 px-3 flex items-center justify-center" 
                                    title="Згенерувати нове посилання"
                                >
                                    {isGenerating ? <Loader size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                </Button>
                                <Button 
                                    onClick={handleDeleteInvite} 
                                    variant="outline" 
                                    className="shrink-0 px-3 flex items-center justify-center text-(--platform-danger) hover:bg-red-50 dark:hover:bg-red-900/20 border-(--platform-border-color) hover:border-red-200 dark:hover:border-red-900/50 transition-colors" 
                                    title="Видалити посилання"
                                >
                                    <Trash size={18} />
                                </Button>
                            </div>
                        )}
                        <p className="text-xs text-(--platform-text-secondary) mt-3">
                            Посилання дійсне протягом 48 годин. Будь-хто з посиланням зможе редагувати ваш сайт.
                        </p>
                    </div>
                )}
                <div>
                    {isLoading ? (
                        <div className="flex justify-center p-4"><Loader className="animate-spin text-(--platform-text-secondary)" size={24} /></div>
                    ) : (
                        <div>
                            <h4 className="text-xs font-bold text-(--platform-text-secondary) uppercase tracking-wider mb-2">Власник</h4>
                            <div 
                                className="flex items-center justify-between p-4 rounded-xl border border-(--platform-accent)" 
                                style={{ background: 'color-mix(in srgb, var(--platform-accent), transparent 95%)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar 
                                        url={isOwner ? user?.avatar_url : siteData?.author_avatar} 
                                        name={isOwner ? user?.username : (siteData?.author || 'Власник')} 
                                        size={40} 
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-(--platform-text-primary) m-0">
                                            {isOwner ? user?.username : (siteData?.author || 'Власник сайту')} 
                                            {isOwner && <span className="text-(--platform-accent) font-normal ml-1">(Ви)</span>}
                                        </p>
                                        <p className="text-xs text-(--platform-text-secondary) m-0 mt-0.5">
                                            {isOwner ? user?.email : (siteData?.author_email || 'Повний доступ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span 
                                        className="text-xs font-medium px-2.5 py-1 text-(--platform-accent) rounded-md border border-(--platform-accent)" 
                                        style={{ background: 'color-mix(in srgb, var(--platform-accent), transparent 90%)' }}
                                    >
                                        Власник
                                    </span>
                                </div>
                            </div>
                            <h4 className="text-xs font-bold text-(--platform-text-secondary) uppercase tracking-wider mb-2 mt-6">Співавтори</h4>
                            {collaborators.length === 0 ? (
                                <div className="text-sm text-(--platform-text-secondary) text-center p-6 border border-dashed border-(--platform-border-color) rounded-lg">
                                    {isOwner ? 'У вас ще немає співавторів.' : 'У цього сайту поки немає інших співавторів.'}
                                </div>
                            ) : (
                                <div className="space-y-3 relative z-0">
                                    {collaborators.map(collab => (
                                        <div key={collab.id} className="flex items-center justify-between p-3 bg-(--platform-bg) rounded-lg border border-(--platform-border-color)">
                                            <div className="flex items-center gap-3">
                                                <Avatar url={collab.avatar_url} name={collab.username} size={36} />
                                                <div>
                                                    <p className="text-sm font-medium text-(--platform-text-primary) m-0">
                                                        {collab.username} {user?.id === collab.id && <span className="text-(--platform-text-secondary) font-normal">(Ви)</span>}
                                                    </p>
                                                    <p className="text-xs text-(--platform-text-secondary) m-0">{collab.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isOwner && (
                                                    <button 
                                                        onClick={() => openPermissionsModal(collab)}
                                                        className="p-1.5 flex items-center justify-center text-(--platform-text-secondary) bg-transparent border border-(--platform-border-color) rounded-md transition-all cursor-pointer hover:text-(--platform-accent) hover:border-(--platform-accent)"
                                                        title="Налаштувати доступи"
                                                    >
                                                        <Settings size={16} />
                                                    </button>
                                                )}
                                                {(isOwner || user?.id === collab.id) && (
                                                    <button 
                                                        onClick={() => promptRemoveCollaborator(collab.id)}
                                                        className="p-1.5 flex items-center justify-center text-(--platform-text-secondary) bg-transparent border border-(--platform-border-color) rounded-md transition-all cursor-pointer hover:text-red-500 hover:border-red-500"
                                                        title={user?.id === collab.id ? "Покинути команду" : "Видалити з команди"}
                                                    >
                                                        <UserMinus size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {isOwner && (
                <div className="rounded-2xl border border-(--platform-accent) p-5 sm:p-8 shadow-sm mt-6" style={{ background: 'color-mix(in srgb, var(--platform-accent), transparent 95%)' }}>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-(--platform-accent) m-0 mb-1 flex items-center gap-2.5 uppercase tracking-wide">
                                <ArrowRightLeft size={20} /> Передача сайту
                            </h3>
                            <p className="text-sm text-(--platform-accent) m-0 opacity-80">
                                Ви можете повністю передати права власності на цей сайт іншому користувачу. <strong>Ви втратите всі доступи до сайту відразу після передачі.</strong>
                            </p>
                        </div>
                        <form onSubmit={handleTransferSubmit} className="w-full lg:w-[320px] shrink-0 flex flex-col items-center gap-3">
                            <div className="w-full">
                                <Input 
                                    type="email" 
                                    name="newOwnerEmail"
                                    placeholder="Email клієнта" 
                                    value={transferEmail} 
                                    onChange={e => setTransferEmail(e.target.value)} 
                                    required 
                                    className="w-full m-0"
                                    style={{ margin: 0 }}
                                />
                            </div>
                            <div className="w-full">
                                <Input 
                                    type="password" 
                                    name="transferPassword"
                                    placeholder="Ваш поточний пароль" 
                                    value={transferPassword} 
                                    onChange={e => setTransferPassword(e.target.value)} 
                                    required 
                                    className="w-full m-0"
                                    style={{ margin: 0 }}
                                />
                            </div>
                            <Button 
                                type="submit" 
                                variant="primary"
                                disabled={isTransferring || !transferEmail || !transferPassword}
                                className="w-full h-11.5 mt-1 flex justify-center items-center gap-2"
                            >
                                {isTransferring ? <Loader size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                                {isTransferring ? 'Передача...' : 'Передати права'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={removeModalConfig.isOpen}
                title={isLeaving ? 'Покинути проєкт' : 'Видалення користувача'}
                message={isLeaving 
                    ? 'Ви дійсно хочете покинути цей проєкт? Ви втратите доступ до редагування сайту.' 
                    : 'Ви дійсно хочете видалити цього користувача з команди? Він втратить доступ до редагування сайту.'}
                confirmLabel={isLeaving ? 'Так, покинути' : 'Видалити'}
                onConfirm={executeRemoveCollaborator}
                onCancel={() => setRemoveModalConfig({ isOpen: false, userId: null })}
                type="danger"
            />
            <ConfirmModal 
                isOpen={isTransferModalOpen}
                title="Передача прав власності"
                message={`Ви дійсно хочете передати права власності користувачу ${transferEmail}? ЦЯ ДІЯ НЕЗВОРОТНА. Ви більше не зможете керувати цим сайтом. Введіть TRANSFER для підтвердження.`}
                confirmLabel="Так, передати права"
                onConfirm={executeTransferOwnership}
                onCancel={() => setIsTransferModalOpen(false)}
                type="danger"
                requireInput={true}
                expectedInput="TRANSFER"
            />
            {permissionsModal.isOpen && permissionsModal.targetUser && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 sm:p-5 border-b border-(--platform-border-color) flex justify-between items-center bg-(--platform-bg)">
                            <h3 className="font-semibold text-(--platform-text-primary) text-lg m-0 flex items-center gap-2">
                                <Settings size={18} className="text-(--platform-accent)" /> 
                                Права доступу
                            </h3>
                        </div>
                        <div className="p-4 sm:p-5 bg-(--platform-card-bg) border-b border-(--platform-border-color)">
                            <p className="text-sm text-(--platform-text-secondary) m-0 mb-4">
                                Виберіть, які розділи панелі керування будуть доступні для <strong className="text-(--platform-text-primary)">{permissionsModal.targetUser.username}</strong>:
                            </p>
                            <div className="flex flex-col gap-2.5">
                                {AVAILABLE_PERMISSIONS.map(perm => {
                                    const Icon = perm.icon;
                                    const isChecked = permissionsModal.currentPermissions.includes(perm.key);
                                    return (
                                        <div 
                                            key={perm.key} 
                                            className={`flex items-center justify-between p-3.5 border rounded-xl transition-all cursor-pointer
                                                ${isChecked ? 'bg-(--platform-bg) border-(--platform-accent)/40 shadow-sm' : 'bg-(--platform-card-bg) border-(--platform-border-color) hover:border-(--platform-text-secondary)/40'}
                                            `}
                                            onClick={() => togglePermission(perm.key)}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className={`p-2 rounded-lg flex items-center justify-center transition-colors
                                                    ${isChecked ? 'bg-(--platform-accent)/10 text-(--platform-accent)' : 'bg-(--platform-bg) text-(--platform-text-secondary)'}
                                                `}>
                                                    <Icon size={18} />
                                                </div>
                                                <span className={`font-medium ${isChecked ? 'text-(--platform-text-primary)' : 'text-(--platform-text-secondary)'}`}>
                                                    {perm.text}
                                                </span>
                                            </div>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Switch 
                                                    checked={isChecked}
                                                    onChange={() => togglePermission(perm.key)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 sm:p-5 flex justify-end gap-3 bg-(--platform-bg)">
                            <Button 
                                variant="outline" 
                                onClick={() => setPermissionsModal({ isOpen: false, targetUser: null, currentPermissions: [] })}
                                disabled={isSavingPermissions}
                            >
                                Скасувати
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={savePermissions}
                                disabled={isSavingPermissions}
                                className="flex gap-2 items-center min-w-30 justify-center"
                            >
                                {isSavingPermissions ? <Loader size={16} className="animate-spin" /> : null}
                                Зберегти
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TeamSettingsSection;