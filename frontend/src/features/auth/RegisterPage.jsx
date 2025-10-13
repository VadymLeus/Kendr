// frontend/src/features/auth/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/api';

const API_URL = 'http://localhost:5000';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '', 
        password: '',
        phone_number: ''
    });
    const [defaultAvatars, setDefaultAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [customAvatarFile, setCustomAvatarFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDefaultAvatars = async () => {
            try {
                const response = await apiClient.get('/users/default-avatars');
                setDefaultAvatars(response.data);
                if (response.data.length > 0) {
                    const initialAvatar = response.data[0];
                    setSelectedAvatar(initialAvatar);
                    setPreview(`${API_URL}${initialAvatar}`);
                }
            } catch (err) {
                console.error("Не вдалося завантажити стандартні аватари", err);
                setError('Не вдалося завантажити варіанти аватарів.');
            }
        };
        fetchDefaultAvatars();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCustomAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomAvatarFile(file);
            setSelectedAvatar('');
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSelectDefault = (avatarUrl) => {
        setSelectedAvatar(avatarUrl);
        setCustomAvatarFile(null);
        setPreview(`${API_URL}${avatarUrl}`);
        const fileInput = document.getElementById('avatar-upload');
        if(fileInput) fileInput.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const registrationData = new FormData();
        registrationData.append('username', formData.username);
        registrationData.append('email', formData.email);
        registrationData.append('password', formData.password);
        registrationData.append('phone_number', formData.phone_number);

        if (customAvatarFile) {
            registrationData.append('avatar', customAvatarFile);
        } else if (selectedAvatar) {
            registrationData.append('avatar_url', selectedAvatar);
        }

        try {
            await apiClient.post('/auth/register', registrationData);
            alert('Реєстрація пройшла успішно! Тепер ви можете увійти.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка реєстрації');
        } finally {
            setIsLoading(false);
        }
    };

    const containerStyle = {
        maxWidth: '450px',
        margin: '2rem auto',
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
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#2d3748' }}>Створення акаунту</h2>

            {error && <p style={{ color: '#e53e3e', background: '#fed7d7', padding: '10px', borderRadius: '8px' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    {preview && <img src={preview} alt="Аватар" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0' }} />}
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', margin: '1rem 0' }}>
                        {defaultAvatars.map(url => (
                            <img 
                                key={url}
                                src={`${API_URL}${url}`} 
                                alt="стандартний аватар"
                                onClick={() => handleSelectDefault(url)}
                                style={{ width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', border: selectedAvatar === url ? '3px solid #4299e1' : '3px solid transparent', transition: 'border 0.2s' }}
                            />
                        ))}
                    </div>
                    <label htmlFor="avatar-upload" style={{ cursor: 'pointer', color: '#4299e1', textDecoration: 'underline' }}>Завантажити свій</label>
                    <input type="file" id="avatar-upload" onChange={handleCustomAvatarChange} accept="image/*" style={{ display: 'none' }} />
                </div>

                <div style={inputGroupStyle}>
                    <label htmlFor="username" style={labelStyle}>Ім'я користувача</label>
                    <input id="username" type="text" name="username" placeholder="JohnDoe" style={inputStyle} onChange={handleChange} required />
                </div>

                <div style={inputGroupStyle}>
                    <label htmlFor="email" style={labelStyle}>Email</label>
                    <input id="email" type="email" name="email" placeholder="user@example.com" style={inputStyle} onChange={handleChange} required />
                </div>
                
                {/* Нове поле для номера телефону */}
                <div style={inputGroupStyle}>
                    <label htmlFor="phone_number" style={labelStyle}>Номер телефону (необов'язково)</label>
                    <input id="phone_number" type="tel" name="phone_number" placeholder="+380 (99) 123-45-67" style={inputStyle} onChange={handleChange} />
                </div>
                
                <div style={inputGroupStyle}>
                    <label htmlFor="password" style={labelStyle}>Пароль</label>
                    <input id="password" type="password" name="password" placeholder="Мін. 6 символів" style={inputStyle} onChange={handleChange} required minLength="6" />
                </div>

                <button type="submit" style={buttonStyle} disabled={isLoading}>
                    {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#718096' }}>
                Вже є акаунт? <Link to="/login" style={{ color: '#4299e1' }}>Увійти</Link>
            </p>
        </div>
    );
};

export default RegisterPage;