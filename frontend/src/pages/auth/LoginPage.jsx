// frontend/src/pages/auth/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthContext';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await apiClient.post('/auth/login', formData);
            const userData = response.data.user;
            login(userData, response.data.token);

            toast.success(`З поверненням, ${userData.username}!`);

            if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error("Login failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const containerStyle = {
        maxWidth: '400px',
        margin: '4rem auto',
        padding: '2rem 2.5rem',
        background: 'var(--platform-card-bg)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontFamily: 'sans-serif'
    };

    const inputStyle = { 
        width: '100%', 
        padding: '12px', 
        borderRadius: '8px', 
        border: '1px solid var(--platform-border-color)',
        boxSizing: 'border-box',
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        marginBottom: '1rem'
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '1.5rem', 
                color: 'var(--platform-text-primary)'
            }}>
                Вхід в акаунт
            </h2>

            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    style={inputStyle} 
                    onChange={handleChange} 
                    required 
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Пароль" 
                    style={inputStyle} 
                    onChange={handleChange} 
                    required 
                />
                
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '1rem' }} 
                    disabled={isLoading}
                >
                    {isLoading ? 'Вхід...' : 'Увійти'}
                </button>
            </form>

            <p style={{ 
                textAlign: 'center', 
                marginTop: '1.5rem', 
                color: 'var(--platform-text-secondary)'
            }}>
                Немає акаунта? <Link to="/register" style={{ color: 'var(--platform-accent)' }}>Зареєструватися</Link>
            </p>
        </div>
    );
};

export default LoginPage;