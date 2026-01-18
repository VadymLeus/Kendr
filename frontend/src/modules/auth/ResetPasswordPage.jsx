// frontend/src/modules/auth/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../shared/api/api';
import { toast } from 'react-toastify';
import { Input, Button } from '../../shared/ui/elements';
import PasswordStrengthMeter from '../../shared/ui/complex/PasswordStrengthMeter';
import { analyzePassword } from '../../shared/utils/validationUtils';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { isValid } = analyzePassword(password);
        if (!isValid) {
            toast.warning("Пароль занадто слабкий.");
            return;
        }

        if (password !== confirmPassword) {
            toast.warning('Паролі не співпадають');
            return;
        }
        
        setIsLoading(true);
        try {
            await apiClient.post('/auth/reset-password', { token, newPassword: password });
            toast.success('Пароль успішно змінено!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка зміни пароля');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return <div style={{padding: '2rem', textAlign: 'center'}}>Невірне посилання</div>;
    const cardStyle = {
        maxWidth: '400px', width: '90%', margin: '0 auto',
        background: 'var(--platform-card-bg)', padding: '2rem',
        borderRadius: '16px', border: '1px solid var(--platform-border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--platform-bg)' }}>
            <div style={cardStyle}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--platform-text-primary)', margin: 0 }}>Новий пароль</h2>
                    <p style={{ color: 'var(--platform-text-secondary)', fontSize: '0.9rem' }}>Придумайте надійний пароль</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Input 
                            type="password" 
                            label="Новий пароль" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                        <PasswordStrengthMeter password={password} />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <Input 
                            type="password" 
                            label="Підтвердіть пароль" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} style={{ width: '100%', marginTop: '1rem' }}>
                        {isLoading ? 'Збереження...' : 'Змінити пароль'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;