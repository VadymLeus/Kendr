// frontend/src/modules/auth/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';
import { Input, Button } from '../../../common/components/ui';
import { validatePassword } from '../../../common/utils/validationUtils';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const passwordChecks = validatePassword(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!passwordChecks.isValid) {
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
                        {/* Візуальні індикатори */}
                        {password && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                <Badge active={passwordChecks.length} text="8+ симв." />
                                <Badge active={passwordChecks.number} text="123" />
                                <Badge active={passwordChecks.capital} text="ABC" />
                            </div>
                        )}
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

const Badge = ({ active, text }) => (
    <span style={{
        fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
        background: active ? 'rgba(72, 187, 120, 0.2)' : 'var(--platform-bg)',
        color: active ? '#2f855a' : 'var(--platform-text-secondary)',
        border: `1px solid ${active ? '#48bb78' : 'var(--platform-border-color)'}`,
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
    }}>
        {active ? '✓ ' : ''}{text}
    </span>
);

export default ResetPasswordPage;