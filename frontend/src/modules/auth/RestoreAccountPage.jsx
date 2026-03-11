// frontend/src/modules/auth/RestoreAccountPage.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../app/providers/AuthContext';
import { toast } from 'react-toastify';
import { Button } from '../../shared/ui/elements/Button';
import { useConfirm } from '../../shared/hooks/useConfirm';
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react';

const RestoreAccountPage = () => {
    const { restoreAccount, logout, user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const { confirm } = useConfirm();
    const handleRestore = () => {
        confirm({
            title: 'Відновити акаунт?',
            message: 'Ваш акаунт та всі сайти будуть повністю відновлені. Введіть "RESTORE" для підтвердження.',
            requireInput: true,
            expectedInput: 'RESTORE',
            confirmText: 'Відновити',
            type: 'success',
            onConfirm: async (inputValue) => {
                if (inputValue !== 'RESTORE') {
                    return toast.error('Невірне підтвердження.');
                }
                
                setIsLoading(true);
                try {
                    await restoreAccount();
                    toast.success('Акаунт успішно відновлено! Вітаємо з поверненням.');
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Помилка відновлення акаунту');
                    setIsLoading(false);
                }
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-(--platform-bg) p-4">
            <div className="max-w-md w-full bg-(--platform-card-bg) border border-(--platform-border-color) rounded-2xl shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-red-100/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={32} />
                </div>
                <h1 className="text-2xl font-bold text-(--platform-text-primary) mb-3">
                    Акаунт видаляється
                </h1>
                <p className="text-(--platform-text-secondary) mb-8 leading-relaxed text-sm">
                    Привіт, <strong className="text-(--platform-text-primary)">{user?.username || 'користувач'}</strong>! Ваш акаунт знаходиться в процесі видалення. 
                    У вас є 14 днів з моменту запиту, щоб передумати. Якщо ви відновите акаунт, всі ваші сайти та дані будуть повністю збережені та відновлені.
                </p>
                <div className="flex flex-col gap-3">
                    <Button 
                        variant="primary"
                        onClick={handleRestore} 
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 py-3 text-[15px] font-medium transition-all"
                    >
                        {isLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Скасувати видалення'}
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={logout}
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 text-(--platform-text-secondary) hover:bg-black/5 dark:hover:bg-white/5 py-3"
                    >
                        <LogOut size={18} />
                        Вийти
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RestoreAccountPage;