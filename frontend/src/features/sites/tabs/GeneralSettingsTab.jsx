// frontend/src/features/sites/tabs/GeneralSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/api';

const GeneralSettingsTab = ({ siteData }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState(siteData.title);
    const [status, setStatus] = useState(siteData.status);
    const [siteMode, setSiteMode] = useState(siteData.site_theme_mode || 'light');
    const [siteAccent, setSiteAccent] = useState(siteData.site_theme_accent || 'orange');
    const [allTags, setAllTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState(new Set());
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const allTagsRes = await apiClient.get('/tags');
                setAllTags(allTagsRes.data);
                const siteTagsRes = await apiClient.get(`/tags/site/${siteData.id}`);
                setSelectedTags(new Set(siteTagsRes.data.map(t => t.id)));
            } catch (err) {
                setError('Не вдалося завантажити теги.');
            }
        };
        fetchTags();
    }, [siteData.id]);

    const handleTagChange = (tagId) => {
        const newSelectedTags = new Set(selectedTags);
        if (newSelectedTags.has(tagId)) {
            newSelectedTags.delete(tagId);
        } else {
            newSelectedTags.add(tagId);
        }
        setSelectedTags(newSelectedTags);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            await apiClient.put(`/sites/${siteData.site_path}/settings`, {
                title,
                status,
                tags: Array.from(selectedTags),
                site_theme_mode: siteMode,
                site_theme_accent: siteAccent,
                theme_settings: siteData.theme_settings || null,
                header_settings: siteData.header_settings || null
            });
            alert('Налаштування успішно збережено!');
            window.location.reload();
        } catch (err) {
            setError('Не вдалося зберегти налаштування.');
        } finally {
            setSaving(false);
        }
    };

    const siteModes = [
        { value: 'light', label: 'Світла' },
        { value: 'dark', label: 'Темна' }
    ];
    
    const siteAccents = [
        { value: 'orange', label: 'Помаранчевий', color: '#dd6b20' },
        { value: 'blue', label: 'Синій', color: '#2b6cb0' },
        { value: 'green', label: 'Зелений', color: '#2f855a' },
        { value: 'red', label: 'Червоний', color: '#e53e3e' },
        { value: 'purple', label: 'Фіолетовий', color: '#805ad5' },
        { value: 'gray', label: 'Сірий', color: '#718096' },
        { value: 'yellow', label: 'Жовтий', color: '#d69e2e' },
        { value: 'lime', label: 'Лаймовий', color: '#8cc152' }
    ];

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '4px',
        fontSize: '1rem',
        marginTop: '0.5rem',
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)'
    };

    const cardStyle = {
        background: 'var(--platform-card-bg)',
        padding: '1.5rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid var(--platform-border-color)',
        marginBottom: '1.5rem'
    };

    return (
        <div>
            <h2 style={{ color: 'var(--platform-text-primary)', marginBottom: '1.5rem' }}>Загальні налаштування</h2>
            
            {error && (
                <div style={{ 
                    color: 'var(--platform-danger)', 
                    marginBottom: '1rem',
                    padding: '10px',
                    backgroundColor: 'rgba(229, 62, 62, 0.1)',
                    border: '1px solid var(--platform-danger)',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}
            
            <button 
                onClick={handleSave} 
                disabled={saving}
                style={{
                    width: '100%',
                    padding: '12px 24px',
                    backgroundColor: 'var(--platform-accent)',
                    color: 'var(--platform-accent-text)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    marginBottom: '1.5rem'
                }}
            >
                {saving ? 'Збереження...' : 'Зберегти зміни'}
            </button>

            <div style={cardStyle}>
                <h4 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>Основні налаштування</h4>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        color: 'var(--platform-text-primary)',
                        fontWeight: '500'
                    }}>
                        Назва сайту:
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={inputStyle}
                        placeholder="Введіть назву сайту"
                    />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        color: 'var(--platform-text-primary)',
                        fontWeight: '500'
                    }}>
                        Статус:
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="draft">Чернетка</option>
                        <option value="published">Опубліковано</option>
                    </select>
                </div>
            </div>

            <div style={cardStyle}>
                <h4 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>Дизайн сайту</h4>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        color: 'var(--platform-text-primary)',
                        fontWeight: '500'
                    }}>
                        Режим теми:
                    </label>
                    <select
                        value={siteMode}
                        onChange={(e) => setSiteMode(e.target.value)}
                        style={inputStyle}
                    >
                        {siteModes.map(mode => (
                            <option key={mode.value} value={mode.value}>
                                {mode.label}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        color: 'var(--platform-text-primary)',
                        fontWeight: '500'
                    }}>
                        Акцентний колір:
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {siteAccents.map(accent => (
                            <div key={accent.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setSiteAccent(accent.value)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        border: siteAccent === accent.value ? '3px solid var(--platform-accent)' : '3px solid var(--platform-border-color)',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: accent.color
                                    }}
                                    title={accent.label}
                                />
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'var(--platform-text-secondary)',
                                    textAlign: 'center'
                                }}>
                                    {accent.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div style={cardStyle}>
                <h4 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>Теги</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {allTags.map(tag => (
                        <label 
                            key={tag.id} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: selectedTags.has(tag.id) ? 'var(--platform-accent)' : 'var(--platform-card-bg)',
                                color: selectedTags.has(tag.id) ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
                                border: `1px solid ${selectedTags.has(tag.id) ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
                                borderRadius: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontWeight: '500'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedTags.has(tag.id)}
                                onChange={() => handleTagChange(tag.id)}
                                style={{ display: 'none' }}
                            />
                            {tag.name}
                        </label>
                    ))}
                </div>
                {allTags.length === 0 && (
                    <p style={{ color: 'var(--platform-text-secondary)', fontStyle: 'italic' }}>
                        Теги відсутні. Створіть теги в адмін-панелі платформи.
                    </p>
                )}
            </div>
        </div>
    );
};

export default GeneralSettingsTab;