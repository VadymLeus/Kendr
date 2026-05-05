// frontend/src/modules/auth/AuthSuccessPage.jsx
import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../app/providers/AuthContext';
import apiClient from '../../shared/api/api';
import { toast } from 'react-toastify';
import LoadingState from '../../shared/ui/complex/LoadingState';

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
                const isDeleted = response.data?.status === 'deleted';
                login(response.data, token, isDeleted);
                if (isDeleted) {
                    toast.warning('Акаунт знаходиться в процесі видалення.');
                } else {
                    toast.success(`Вітаємо, ${response.data.username}!`);
                }
                const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectUrl, { replace: true });
                
            } catch (error) {
                console.error("Помилка отримання даних профілю:", error);
                if (error.response?.status !== 403) {
                    toast.error('Помилка авторизації через Google');
                }
                localStorage.removeItem('token');
                localStorage.removeItem('redirectAfterLogin');
                navigate('/login');
            }
        };
        
        fetchUserData();
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-dvh flex flex-col justify-center items-center bg-(--platform-bg) px-4">
            <LoadingState 
                title="Вхід у систему..." 
                layout="page" 
                iconSize={48} 
            />
        </div>
    );
};

export default AuthSuccessPage;