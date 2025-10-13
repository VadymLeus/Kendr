// frontend/src/features/profile/PublicProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/api';

const API_URL = 'http://localhost:5000';

const PublicProfilePage = () => {
    const { username } = useParams();
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

    if (loading) return <div>Завантаження профілю...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

    return (
        <div style={{ padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '700px', margin: '2rem auto', textAlign: 'center' }}>
            {profileData.avatar_url && (
                <img src={`${API_URL}${profileData.avatar_url}`} alt="avatar" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} />
            )}
            <h1>Профіль користувача</h1>
            <h2>{profileData.username}</h2>
            <p>На Kendr з: <strong>{new Date(profileData.createdAt).toLocaleDateString('uk-UA')}</strong></p>
            <p>Створено сайтів: <strong>{profileData.siteCount}</strong></p>
        </div>
    );
};

export default PublicProfilePage;