// frontend/src/modules/profile/pages/ProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../../../common/services/api';
import { AuthContext } from '../../../app/providers/AuthContext';
import { Button } from '../../../common/components/ui/Button';
import Avatar from '../../../common/components/ui/Avatar';
import { 
    IconTelegram, 
    IconInstagram, 
    IconGlobe, 
    IconSettings, 
    IconCalendar, 
    IconGrid, 
    IconUser,
    IconLoader,
    IconExternalLink,
    IconMail,
    IconEyeOff, 
    IconSearch
} from '../../../common/components/ui/Icons';

const ProfilePage = () => {
    const { username } = useParams();
    const { user } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorStatus, setErrorStatus] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setErrorStatus(null);
                const response = await apiClient.get(`/users/${username}`, {
                    suppressToast: true
                });
                
                setProfileData(response.data);
            } catch (err) {
                if (err.response) {
                    setErrorStatus(err.response.status);
                } else {
                    setErrorStatus(500);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    const isOwner = user && user.username === username;
    const containerStyle = {
        maxWidth: '1280px', 
        width: '100%',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        minHeight: '80vh'
    };

    const sectionStyle = {
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        overflow: 'hidden',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    };

    const errorContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        color: 'var(--platform-text-secondary)'
    };

    const errorIconCircleStyle = {
        width: '80px',
        height: '80px',
        background: 'var(--platform-bg)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        border: '1px solid var(--platform-border-color)'
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <IconLoader size={32} className="animate-spin" style={{ color: 'var(--platform-accent)' }} />
        </div>
    );

    if (errorStatus === 403) {
        return (
            <div style={containerStyle}>
                <Helmet><title>Приватний профіль | Kendr</title></Helmet>
                <div style={errorContainerStyle}>
                    <div style={errorIconCircleStyle}>
                        <IconEyeOff size={40} />
                    </div>
                    <h2 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>
                        Цей профіль закритий
                    </h2>
                    <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                        Користувач <strong>@{username}</strong> обмежив доступ до своєї сторінки. 
                    </p>
                    
                    <Link to="/" style={{ marginTop: '1.5rem', textDecoration: 'none' }}>
                        <Button variant="secondary">На головну</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (errorStatus === 404) {
        return (
            <div style={containerStyle}>
                <Helmet><title>Користувача не знайдено | Kendr</title></Helmet>
                <div style={errorContainerStyle}>
                    <div style={errorIconCircleStyle}>
                        <IconSearch size={40} />
                    </div>
                    <h2 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>
                        Користувача не знайдено
                    </h2>
                    <p>
                        Ми не змогли знайти профіль з іменем <strong>@{username}</strong>.
                    </p>
                    <Link to="/" style={{ marginTop: '1.5rem', textDecoration: 'none' }}>
                        <Button variant="secondary">На головну</Button>
                    </Link>
                </div>
            </div>
        );
    }
    
    if (errorStatus) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--platform-danger)' }}>
                Сталася помилка при завантаженні профілю.
            </div>
        );
    }

    const userAccentColor = profileData?.accent_color || 'var(--platform-accent)';
    
    const coverStyle = {
        height: '240px',
        width: '100%',
        position: 'relative',
        background: `linear-gradient(to bottom, ${userAccentColor}, var(--platform-card-bg))`
    };

    const topInfoStyle = {
        padding: '0 2rem 2rem 2rem',
        marginTop: '-80px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2rem',
        position: 'relative',
        flexWrap: 'wrap'
    };

    const avatarWrapperStyle = {
        borderRadius: '50%',
        border: '6px solid var(--platform-card-bg)',
        background: 'var(--platform-bg)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        flexShrink: 0,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
    };

    const headerContentStyle = {
        flex: 1,
        paddingBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '1rem'
    };

    const infoGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '2rem',
        marginBottom: '2rem'
    };

    const cardHeaderStyle = {
        padding: '1.5rem 1.5rem 1rem 1.5rem',
        borderBottom: '1px solid var(--platform-border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const cardTitleStyle = {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'var(--platform-text-primary)',
        margin: 0
    };

    const cardBodyStyle = {
        padding: '1.5rem'
    };

    const bioTextStyle = {
        color: 'var(--platform-text-secondary)',
        lineHeight: '1.7',
        fontSize: '1rem',
        whiteSpace: 'pre-wrap'
    };

    const statItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 0',
        borderBottom: '1px solid var(--platform-border-color)',
        fontSize: '1rem',
        color: 'var(--platform-text-secondary)'
    };

    const socialLinkStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        border: '1px solid transparent',
        marginBottom: '0.75rem'
    };

    return (
        <div style={containerStyle}>
            <Helmet>
                <title>{profileData.username} | Профіль Kendr</title>
            </Helmet>

            <div style={sectionStyle}>
                <div style={coverStyle}></div>
                
                <div style={topInfoStyle}>
                    <div style={avatarWrapperStyle}>
                        <Avatar 
                            url={profileData.avatar_url} 
                            name={profileData.username} 
                            size={160} 
                            fontSize="64px"
                        />
                    </div>
                    
                    <div style={headerContentStyle}>
                        <div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <h1 style={{ 
                                    fontSize: '2.5rem', fontWeight: '800', color: 'var(--platform-text-primary)',
                                    margin: '0 0 0.5rem 0', lineHeight: '1'
                                }}>
                                    {profileData.username}
                                </h1>
                                {!profileData.is_profile_public && isOwner && (
                                    <div title="Приватний профіль (бачите тільки ви)" style={{paddingBottom: '8px'}}>
                                        <IconEyeOff size={24} color="var(--platform-text-secondary)" />
                                    </div>
                                )}
                            </div>
                            
                            <p style={{ 
                                color: 'var(--platform-text-secondary)', margin: 0, 
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem'
                            }}>
                                <IconCalendar size={16} style={{ color: 'var(--platform-accent)' }}/> 
                                На платформі з {new Date(profileData.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        {isOwner && (
                            <Link to="/settings" style={{ textDecoration: 'none', flexShrink: 0 }}>
                                <Button variant="secondary" icon={<IconSettings size={18}/>}>
                                    Налаштувати
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {profileData.bio && (
                <div style={sectionStyle}>
                    <div style={cardHeaderStyle}>
                        <IconUser size={24} style={{ color: 'var(--platform-accent)' }} />
                        <h3 style={cardTitleStyle}>Про мене</h3>
                    </div>
                    <div style={cardBodyStyle}>
                        <p style={bioTextStyle}>{profileData.bio}</p>
                    </div>
                </div>
            )}

            <div style={infoGridStyle}>
                
                <div style={{ ...sectionStyle, marginBottom: 0, height: '100%' }}>
                    <div style={cardHeaderStyle}>
                        <IconGrid size={24} style={{ color: 'var(--platform-accent)' }} />
                        <h3 style={cardTitleStyle}>Статистика</h3>
                    </div>
                    <div style={cardBodyStyle}>
                        <div style={statItemStyle}>
                            <span>Опубліковано сайтів</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--platform-text-primary)' }}>
                                {profileData.siteCount || 0}
                            </span>
                        </div>
                        <div style={{ ...statItemStyle, borderBottom: 'none' }}>
                            <span>Рейтинг автора</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--platform-accent)' }}>
                                0.0
                            </span>
                        </div>
                    </div>
                </div>

                {profileData.socials && Object.values(profileData.socials).some(v => v) ? (
                    <div style={{ ...sectionStyle, marginBottom: 0, height: '100%' }}>
                        <div style={cardHeaderStyle}>
                            <IconGlobe size={24} style={{ color: 'var(--platform-accent)' }} />
                            <h3 style={cardTitleStyle}>Контакти</h3>
                        </div>
                        <div style={cardBodyStyle}>
                            {profileData.socials.telegram && (
                                <a 
                                    href={`https://t.me/${profileData.socials.telegram.replace('@', '')}`} 
                                    target="_blank" rel="noreferrer" 
                                    style={socialLinkStyle}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 136, 204, 0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--platform-bg)'}
                                >
                                    <IconTelegram size={22} style={{ color: '#0088cc' }}/> 
                                    Telegram
                                    <IconExternalLink size={16} style={{ marginLeft: 'auto', opacity: 0.5 }}/>
                                </a>
                            )}
                            {profileData.socials.instagram && (
                                <a 
                                    href={`https://instagram.com/${profileData.socials.instagram.replace('@', '')}`} 
                                    target="_blank" rel="noreferrer" 
                                    style={socialLinkStyle}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(225, 48, 108, 0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--platform-bg)'}
                                >
                                    <IconInstagram size={22} style={{ color: '#E1306C' }}/> 
                                    Instagram
                                    <IconExternalLink size={16} style={{ marginLeft: 'auto', opacity: 0.5 }}/>
                                </a>
                            )}
                            {profileData.socials.website && (
                                <a 
                                    href={profileData.socials.website} 
                                    target="_blank" rel="noreferrer" 
                                    style={socialLinkStyle}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--platform-hover-bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--platform-bg)'}
                                >
                                    <IconGlobe size={22} style={{ color: 'var(--platform-text-secondary)' }}/> 
                                    Веб-сайт
                                    <IconExternalLink size={16} style={{ marginLeft: 'auto', opacity: 0.5 }}/>
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ ...sectionStyle, marginBottom: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--platform-text-secondary)' }}>
                            <p>Контакти відсутні</p>
                        </div>
                    </div>
                )}
            </div>

            <div style={sectionStyle}>
                <div style={cardHeaderStyle}>
                    <IconGrid size={24} style={{ color: 'var(--platform-accent)' }} />
                    <h3 style={cardTitleStyle}>Проекти</h3>
                </div>
                
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                     {profileData.siteCount > 0 ? (
                        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                            <p style={{ color: 'var(--platform-text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                У користувача <strong>{profileData.siteCount}</strong> опублікованих сайтів.
                            </p>
                            <div style={{ 
                                padding: '10px 20px', 
                                background: 'var(--platform-bg)', 
                                border: '1px solid var(--platform-border-color)',
                                borderRadius: '30px', 
                                display: 'inline-block',
                                color: 'var(--platform-text-secondary)',
                                fontWeight: '500'
                            }}>
                                Список проектів незабаром з'явиться
                            </div>
                        </div>
                     ) : (
                         <div style={{ maxWidth: '400px', margin: '0 auto', color: 'var(--platform-text-secondary)' }}>
                             <div style={{ marginBottom: '1rem', opacity: 0.5 }}>
                                <IconGlobe size={48} />
                             </div>
                             <p style={{ fontSize: '1.1rem' }}>Немає публічних проектів</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;