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

    if (!token) return <div className="p-8 text-center text-(--platform-danger)">Невірне посилання</div>;
    return (
        <div className="min-h-screen flex items-center justify-center bg-(--platform-bg) p-4">
            <div className="w-full max-w-100 bg-(--platform-card-bg) p-8 rounded-2xl border border-(--platform-border-color) shadow-sm">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-1">Новий пароль</h2>
                    <p className="text-(--platform-text-secondary) text-sm">Придумайте надійний пароль</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <Input 
                            type="password" 
                            label="Новий пароль" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                        <div className="mt-2">
                             <PasswordStrengthMeter password={password} />
                        </div>
                    </div>
                    <div>
                        <Input 
                            type="password" 
                            label="Підтвердіть пароль" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full mt-4">
                        {isLoading ? 'Збереження...' : 'Змінити пароль'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;