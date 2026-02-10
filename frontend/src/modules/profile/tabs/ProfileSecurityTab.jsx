// frontend/src/modules/profile/tabs/ProfileSecurityTab.jsx
import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../app/providers/AuthContext';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import apiClient from '../../../shared/api/api';
import { Input, Button } from '../../../shared/ui/elements';
import PasswordStrengthMeter from '../../../shared/ui/complex/PasswordStrengthMeter';
import { analyzePassword } from '../../../shared/utils/validationUtils';
import { Lock, Trash2, AlertCircle } from 'lucide-react';

const ProfileSecurityTab = () => {
    const { user, updateUser, logout } = useContext(AuthContext);
    const confirm = useConfirm();
    const [isLoading, setIsLoading] = useState(false);
    const hasPassword = user.has_password === true;
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    useEffect(() => {
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, [hasPassword]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Нові паролі не співпадають");
            return;
        }
        const validation = analyzePassword(passwords.newPassword);
        if (!validation.isValid) {
            toast.warning("Пароль має містити мінімум 8 символів, велику літеру, малу літеру та цифру.");
            return;
        }
        setIsLoading(true);
        try {
            const payload = { newPassword: passwords.newPassword };
            if (hasPassword) {
                payload.currentPassword = passwords.currentPassword;
            }
            const response = await apiClient.put('/users/profile/password', payload);
            toast.success(hasPassword ? "Пароль успішно змінено!" : "Пароль успішно встановлено!");
            const updatedUser = {
                ...user,                  
                ...(response.data.user || {}), 
                has_password: true        
            };
            
            updateUser(updatedUser); 
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (error) {
            toast.error(error.response?.data?.message || "Помилка збереження пароля.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        confirm({
            title: 'Видалити акаунт?',
            message: 'Ця дія незворотна. Всі ваші сайти будуть видалені. Напишіть "DELETE" для підтвердження.',
            requireInput: true,
            confirmText: 'Видалити назавжди',
            danger: true,
            onConfirm: async (inputValue) => {
                if (inputValue !== 'DELETE') return toast.error('Невірне підтвердження.');
                try {
                    await apiClient.delete('/users/me', { data: { confirmation: 'DELETE' } });
                    toast.success('Акаунт видалено.');
                    logout();
                } catch (err) {
                    console.error(err);
                    toast.error('Помилка при видаленні акаунту');
                }
            }
        });
    };

    const container = { maxWidth: '800px', margin: '0 auto', width: '100%' };
    const card = { 
        background: 'var(--platform-card-bg)', 
        borderRadius: '16px', 
        border: '1px solid var(--platform-border-color)', 
        padding: '32px', 
        marginBottom: '20px', 
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' 
    };
    const cardTitle = { 
        fontSize: '1.3rem', 
        fontWeight: '600', 
        color: 'var(--platform-text-primary)', 
        margin: '0 0 8px 0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px' 
    };
    const subTitle = { 
        color: 'var(--platform-text-secondary)', 
        marginBottom: '24px', 
        fontSize: '0.9rem', 
        lineHeight: '1.5' 
    };
    const dangerCardStyle = {
        ...card,
        borderColor: 'var(--platform-danger)',
        background: 'color-mix(in srgb, var(--platform-danger), transparent 95%)',
        marginBottom: 0,
        padding: '32px'
    };

    return (
        <div style={container}>
            <div style={card}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{ ...cardTitle, justifyContent: 'center' }}>
                        <Lock size={24} color="var(--platform-accent)" />
                        {hasPassword ? 'Зміна паролю' : 'Встановлення паролю'}
                    </h3>
                    <p style={{ ...subTitle, marginBottom: '0' }}>
                        {hasPassword 
                            ? 'Введіть поточний пароль, щоб встановити новий.'
                            : 'У вас не встановлено пароль (вхід через Google). Створіть його для входу через Email.'
                        }
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
                        {hasPassword && (
                            <Input 
                                name="currentPassword" 
                                label="Поточний пароль" 
                                type="password" 
                                placeholder="••••••••" 
                                value={passwords.currentPassword} 
                                onChange={handleChange} 
                                required 
                            />
                        )}

                        <div>
                            <Input 
                                name="newPassword" 
                                label={hasPassword ? "Новий пароль" : "Придумайте пароль"}
                                type="password" 
                                placeholder="••••••••" 
                                value={passwords.newPassword} 
                                onChange={handleChange} 
                                required 
                            />
                            <PasswordStrengthMeter password={passwords.newPassword} />
                        </div>
                        <Input 
                            name="confirmPassword" 
                            label="Підтвердження" 
                            type="password" 
                            placeholder="••••••••" 
                            value={passwords.confirmPassword} 
                            onChange={handleChange} 
                            required
                            error={passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword ? "Паролі не співпадають" : ""}
                        />
                        <div style={{ marginTop: '8px' }}>
                            <Button 
                                type="submit" 
                                disabled={isLoading} 
                                style={{ width: '100%' }}
                            >
                                {isLoading ? 'Збереження...' : (hasPassword ? 'Оновити пароль' : 'Встановити пароль')}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            <div style={dangerCardStyle}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: '16px' 
                }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ ...cardTitle, color: 'var(--platform-danger)', marginBottom: '4px' }}>
                            <AlertCircle size={22} />
                            Небезпечна зона
                        </h3>
                        <p style={{ margin: 0, color: 'var(--platform-danger)', fontSize: '0.9rem', opacity: 0.8 }}>
                             Видалення акаунту призведе до <strong>незворотної</strong> втрати всіх ваших сайтів та даних.
                        </p>
                    </div>
                    
                    <Button 
                        variant="danger"
                        onClick={handleDeleteAccount}
                        icon={<Trash2 size={18} />}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                    >
                        Видалити акаунт
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default ProfileSecurityTab;