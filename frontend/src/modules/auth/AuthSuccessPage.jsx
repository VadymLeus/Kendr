// frontend/src/modules/auth/AuthSuccessPage.jsx
import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../app/providers/AuthContext';
import apiClient from '../../shared/api/api';
import { toast } from 'react-toastify';
import { Loader } from 'lucide-react';

const AuthSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const processing = useRef(false);
    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            navigate('/login');
            return;
        }
        if (processing.current) return;
        processing.current = true;
        const fetchUserData = async () => {
            try {
                localStorage.setItem('token', token);
                const response = await apiClient.get('/auth/me');
                login(response.data, token);
                toast.success(`Вітаємо, ${response.data.username}!`);
                navigate('/');
            } catch (error) {
                console.error("Помилка отримання даних профілю:", error);
                toast.error('Помилка авторизації через Google');
                localStorage.removeItem('token');
                navigate('/login');
            }
        };
        fetchUserData();
    }, [searchParams, navigate, login]);
    return (
        <div className="h-screen flex flex-col justify-center items-center gap-4 text-(--platform-text-secondary) bg-(--platform-bg)">
            <Loader size={48} className="animate-spin text-(--platform-accent)" />
            <h2 className="text-xl font-medium">Вхід у систему...</h2>
        </div>
    );
};

export default AuthSuccessPage;