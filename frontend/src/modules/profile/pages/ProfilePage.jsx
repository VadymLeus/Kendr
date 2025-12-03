// frontend/src/modules/profile/pages/ProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../../common/services/api';
import { AuthContext } from '../../../app/providers/AuthContext';

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

    if (loading) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center',
            color: 'var(--platform-text-secondary)'
        }}>
            Завантаження профілю...
        </div>
    );
    
    if (error) return (
        <div style={{ 
            color: 'var(--platform-danger)', 
            textAlign: 'center',
            padding: '2rem'
        }}>
            {error}
        </div>
    );

    const containerStyle = {
        padding: '2rem',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '12px',
        maxWidth: '700px',
        margin: '2rem auto',
        textAlign: 'center',
        background: 'var(--platform-card-bg)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };

    const settingsButtonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '1.5rem',
        padding: '12px 24px',
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        textDecoration: 'none',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s ease'
    };

    const statusCardStyle = {
        padding: '1.5rem',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        background: 'var(--platform-bg)',
        marginTop: '1.5rem'
    };

    return (
        <div style={containerStyle}>
            {profileData.avatar_url && (
                <img 
                    src={`${API_URL}${profileData.avatar_url}`} 
                    alt="avatar" 
                    style={{ 
                        width: '150px', 
                        height: '150px', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '3px solid var(--platform-border-color)'
                    }} 
                />
            )}
            <h1 style={{ 
                marginBottom: '0.5rem',
                color: 'var(--platform-text-primary)'
            }}>
                {profileData.username}
            </h1>
            <p style={{ 
                color: 'var(--platform-text-secondary)', 
                marginTop: 0 
            }}>
                На платформі з: <strong>{new Date(profileData.createdAt).toLocaleDateString()}</strong>
            </p>
            
            {isOwner && (
                <Link 
                    to="/settings" 
                    style={settingsButtonStyle}
                    onMouseEnter={(e) => e.target.style.background = 'var(--platform-accent-hover)'}
                    onMouseLeave={(e) => e.target.style.background = 'var(--platform-accent)'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Налаштування профілю</span>
                </Link>
            )}

            <div style={statusCardStyle}>
                <h3 style={{ 
                    marginTop: 0,
                    color: 'var(--platform-text-primary)'
                }}>
                    Статус акаунту
                </h3>
                {profileData.warnings && profileData.warnings.length > 0 ? (
                    <div>
                        <p style={{ 
                            color: 'var(--platform-danger)', 
                            fontWeight: 'bold',
                            marginBottom: '1rem'
                        }}>
                            Є активні попередження!
                        </p>
                        <div style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            {profileData.warnings.map(warning => (
                                <div key={warning.id} title={`Попередження від ${new Date(warning.created_at).toLocaleDateString()}`}>
                                    <span style={{ 
                                        fontSize: '2rem', 
                                        color: 'var(--platform-danger)'
                                    }}>
                                        ⚠️
                                    </span>
                                </div>
                            ))}
                        </div>
                        <small style={{
                            color: 'var(--platform-text-secondary)',
                            fontSize: '0.8rem'
                        }}>
                            Попередження автоматично знімаються через рік, якщо ви не отримуєте нових.
                        </small>
                    </div>
                ) : (
                    <p style={{ 
                        color: 'var(--platform-success)', 
                        fontWeight: 'bold',
                        margin: 0
                    }}>
                        ✅ У вас все добре, активних попереджень немає.
                    </p>
                )}
            </div>

            <hr style={{ 
                margin: '1.5rem 0',
                border: 'none',
                borderTop: '1px solid var(--platform-border-color)'
            }}/>
            
            <div>
                <h3 style={{ color: 'var(--platform-text-primary)' }}>Статистика</h3>
                <p style={{ 
                    color: 'var(--platform-text-primary)',
                    margin: '0.5rem 0'
                }}>
                    Створено сайтів: <strong>{profileData.siteCount}</strong>
                </p>
            </div>
        </div>
    );
};

export default ProfilePage;