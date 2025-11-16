// frontend/src/pages/auth/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthContext';
import apiClient from '../../services/api';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiClient.post('/auth/login', formData);
            const userData = response.data.user;
            login(userData, response.data.token);

            if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Помилка входу');
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

            {error && (
                <p style={{ 
                    color: 'var(--platform-danger)', 
                    background: '#fed7d7', 
                    padding: '10px', 
                    borderRadius: '8px',
                    marginBottom: '1rem'
                }}>
                    {error}
                </p>
            )}

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