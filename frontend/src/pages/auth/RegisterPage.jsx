// frontend/src/pages/auth/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';

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
                toast.error('Не вдалося завантажити варіанти аватарів.');
            }
        };
        fetchDefaultAvatars();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCustomAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Розмір файлу не повинен перевищувати 5MB');
                return;
            }
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
            toast.success('Реєстрація пройшла успішно! Тепер ви можете увійти.');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            // Помилка обробляється глобально в apiClient
            console.error('Помилка реєстрації:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const containerStyle = {
        maxWidth: '450px',
        margin: '2rem auto',
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

    const getAvatarImageStyle = (avatarUrl) => ({
        width: '45px', 
        height: '45px', 
        borderRadius: '50%', 
        cursor: 'pointer', 
        border: selectedAvatar === avatarUrl ? '3px solid var(--platform-accent)' : '3px solid transparent', 
        transition: 'border 0.2s',
        objectFit: 'cover'
    });

    return (
        <div style={containerStyle}>
            <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '1.5rem', 
                color: 'var(--platform-text-primary)'
            }}>
                Створення акаунту
            </h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    {preview && (
                        <img 
                            src={preview} 
                            alt="Аватар" 
                            style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '50%', 
                                objectFit: 'cover', 
                                border: '3px solid var(--platform-border-color)' 
                            }} 
                        />
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', margin: '1rem 0' }}>
                        {defaultAvatars.map(url => (
                            <img 
                                key={url}
                                src={`${API_URL}${url}`} 
                                alt="Стандартний аватар"
                                onClick={() => handleSelectDefault(url)}
                                style={getAvatarImageStyle(url)}
                            />
                        ))}
                    </div>
                    <div>
                        <label 
                            htmlFor="avatar-upload" 
                            className="btn btn-secondary"
                            style={{ 
                                fontSize: '0.9rem',
                                padding: '8px 16px',
                                marginBottom: '0.5rem'
                            }}
                        >
                            📁 Завантажити свій аватар (до 5МБ)
                        </label>
                        <input 
                            type="file" 
                            id="avatar-upload" 
                            onChange={handleCustomAvatarChange} 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                        />
                        {customAvatarFile && (
                            <div style={{ fontSize: '12px', color: 'var(--platform-success)' }}>
                                Обрано: {customAvatarFile.name}
                            </div>
                        )}
                    </div>
                </div>

                <input 
                    type="text" 
                    name="username" 
                    placeholder="Ім'я користувача" 
                    style={inputStyle} 
                    onChange={handleChange} 
                    required 
                />

                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    style={inputStyle} 
                    onChange={handleChange} 
                    required 
                />
                
                <input 
                    type="tel" 
                    name="phone_number" 
                    placeholder="Номер телефону (необов'язково)" 
                    style={inputStyle} 
                    onChange={handleChange} 
                />
                
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Мін. 6 символів" 
                    style={inputStyle} 
                    onChange={handleChange} 
                    required 
                    minLength="6" 
                />

                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '1rem' }} 
                    disabled={isLoading}
                >
                    {isLoading ? '⏳ Реєстрація...' : '🚀 Зареєструватися'}
                </button>
            </form>

            <p style={{ 
                textAlign: 'center', 
                marginTop: '1.5rem', 
                color: 'var(--platform-text-secondary)'
            }}>
                Вже є акаунт? <Link to="/login" style={{ color: 'var(--platform-accent)' }}>Увійти</Link>
            </p>
        </div>
    );
};

export default RegisterPage;