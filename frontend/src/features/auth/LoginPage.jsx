// frontend/src/features/auth/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
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
        maxWidth: '450px',
        margin: '4rem auto',
        padding: '2rem 2.5rem',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontFamily: 'sans-serif'
    };
    
    const inputGroupStyle = { marginBottom: '1rem' };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
        color: '#4a5568',
        textAlign: 'left'
    };

    const inputStyle = { 
        width: '100%', 
        padding: '12px', 
        borderRadius: '8px', 
        border: '1px solid #ccc',
        boxSizing: 'border-box'
    };
    
    const buttonStyle = { 
        width: '100%', 
        padding: '14px', 
        fontSize: '1rem', 
        background: '#242060', 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer',
        marginTop: '1rem'
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#2d3748' }}>Вхід в акаунт</h2>

            {error && <p style={{ color: '#e53e3e', background: '#fed7d7', padding: '10px', borderRadius: '8px' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div style={inputGroupStyle}>
                    <label htmlFor="email" style={labelStyle}>Email</label>
                    <input id="email" type="email" name="email" placeholder="user@example.com" style={inputStyle} onChange={handleChange} required />
                </div>
                
                <div style={inputGroupStyle}>
                    <label htmlFor="password" style={labelStyle}>Пароль</label>
                    <input id="password" type="password" name="password" placeholder="••••••••" style={inputStyle} onChange={handleChange} required />
                </div>
                
                <button type="submit" style={buttonStyle} disabled={isLoading}>
                    {isLoading ? 'Вхід...' : 'Увійти'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#718096' }}>
                Немає акаунта? <Link to="/register" style={{ color: '#4299e1' }}>Зареєструватися</Link>
            </p>
        </div>
    );
};

export default LoginPage;