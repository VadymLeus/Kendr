// frontend/src/features/profile/ProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { AuthContext } from '../auth/AuthContext';

const API_URL = 'http://localhost:5000';

const ProfilePage = () => {
    const { username } = useParams();
    const { user } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/users/${username}`);
                setProfileData(response.data);
            } catch (err) {
                setError('Користувача не знайдено або сталася помилка.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    const isOwner = user && user.username === username;

    if (loading) return <div>Завантаження профілю...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

    const settingsButtonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '1.5rem',
        padding: '10px 20px',
        background: '#242060',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer'
    };

    return (
        <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '700px', margin: '2rem auto', textAlign: 'center', background: '#f8f9fa' }}>
            {profileData.avatar_url && (
                <img src={`${API_URL}${profileData.avatar_url}`} alt="avatar" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} />
            )}
            <h1 style={{ marginBottom: '0.5rem' }}>{profileData.username}</h1>
            <p style={{ color: '#555', marginTop: 0 }}>На платформі з: <strong>{new Date(profileData.createdAt).toLocaleDateString()}</strong></p>
            
            {isOwner && (
                <Link to="/settings" style={settingsButtonStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Налаштування профілю</span>
                </Link>
            )}

            <hr style={{ margin: '1.5rem 0' }}/>
            <div>
                <h3>Статистика</h3>
                <p>Створено сайтів: <strong>{profileData.siteCount}</strong></p>
            </div>
        </div>
    );
};

export default ProfilePage;