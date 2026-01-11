// frontend/src/modules/profile/components/ProfileSecurityTab.jsx
import React, { useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import apiClient from '../../../shared/api/api';
import { Input, Button } from '../../../shared/ui/elements';
import { Lock, Check, LogOut, AlertCircle } from 'lucide-react';

const validateLocalPassword = (password) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isLongEnough = password.length >= 8;

    return {
        isValid: hasLower && hasUpper && hasNumber && isLongEnough,
        hasLower,
        hasUpper,
        hasNumber,
        isLongEnough,
        score: [hasLower, hasUpper, hasNumber, isLongEnough].filter(Boolean).length
    };
};

const PasswordStrengthMeter = ({ password }) => {
    const { score, isValid } = validateLocalPassword(password);

    const getStrengthColor = () => {
        if (score <= 1) return '#e53e3e';
        if (score === 2 || score === 3) return '#ecc94b';
        return '#48bb78';
    };

    const getStrengthLabel = () => {
        if (password.length === 0) return 'Рівень безпеки';
        if (score <= 2) return 'Слабкий';
        if (score === 3) return 'Середній';
        return 'Надійний';
    };

    const bars = [1, 2, 3, 4];

    return (
        <div style={{ marginTop: '6px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                {bars.map((barIndex) => (
                    <div 
                        key={barIndex}
                        style={{
                            height: '4px',
                            flex: 1,
                            borderRadius: '2px',
                            backgroundColor: barIndex <= score ? getStrengthColor() : 'var(--platform-border-color)',
                            transition: 'background-color 0.3s ease'
                        }} 
                    />
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--platform-text-secondary)', fontWeight: '500' }}>
                <span>{getStrengthLabel()}</span>
                {isValid && <span style={{ color: '#48bb78', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12}/> Чудовий</span>}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--platform-text-secondary)', marginTop: '4px', lineHeight: '1.2' }}>
                Мінімум 8 символів, велика та мала літери, цифра.
            </div>
        </div>
    );
};

const ProfileSecurityTab = () => {
    const { user, updateUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
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

        const validation = validateLocalPassword(passwords.newPassword);
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

    const handleLogout = () => {
        logout();
        navigate('/auth');
        toast.info("Ви вийшли з системи");
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
        borderColor: '#fed7d7',
        background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
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
                        <h3 style={{ 
                            ...cardTitle, 
                            color: '#c53030', 
                            marginBottom: '4px' 
                        }}>
                            <AlertCircle size={22} />
                            Вихід з акаунту
                        </h3>
                        <p style={{ 
                            margin: 0, 
                            color: '#c53030', 
                            fontSize: '0.9rem', 
                            opacity: 0.8 
                        }}>
                            Це завершить вашу поточну сесію в цьому браузері.
                        </p>
                    </div>
                    
                    <Button 
                        variant="danger"
                        onClick={handleLogout}
                        icon={<LogOut size={18} />}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                    >
                        Вийти з системи
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default ProfileSecurityTab;