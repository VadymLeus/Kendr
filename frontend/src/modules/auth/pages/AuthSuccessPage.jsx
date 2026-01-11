// frontend/src/modules/auth/pages/AuthSuccessPage.jsx
import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import apiClient from '../../../shared/api/api';
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
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            flexDirection: 'column', 
            gap: '15px',
            color: 'var(--platform-text-secondary)'
        }}>
            <Loader size={48} />
            <h2>Вхід у систему...</h2>
        </div>
    );
};

export default AuthSuccessPage;