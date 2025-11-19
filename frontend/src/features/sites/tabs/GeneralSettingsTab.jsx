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

    const styles = {
        card: {
            background: 'var(--platform-card-bg)', 
            padding: '1.5rem 2rem',
            borderRadius: '12px', 
            border: '1px solid var(--platform-border-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
            marginBottom: '1.5rem'
        },
        input: {
            width: '100%', 
            padding: '0.75rem', 
            border: '1px solid var(--platform-border-color)',
            borderRadius: '4px', 
            fontSize: '1rem', 
            background: 'var(--platform-card-bg)',
            color: 'var(--platform-text-primary)', 
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
            marginTop: '0.5rem'
        },
        label: {
            display: 'block', 
            marginBottom: '0.5rem', 
            color: 'var(--platform-text-primary)', 
            fontWeight: '500',
            fontSize: '0.9rem'
        },
        button: {
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: '500',
            transition: 'all 0.2s ease'
        },
        error: {
            color: 'var(--platform-danger)', 
            background: 'rgba(229, 62, 62, 0.1)', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1rem'
        },
        heading: {
            color: 'var(--platform-text-primary)', 
            marginBottom: '1.5rem',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        }
    };

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
            alert('Налаштування успішно збережено! Сторінка буде перезавантажена, щоб застосувати зміни.');
            window.location.reload();
        } catch (err) {
            setError('Не вдалося зберегти налаштування. Спробуйте ще раз.');
        } finally {
            setSaving(false);
        }
    };

    const siteModes = [
        { value: 'light', label: 'Світла', icon: '☀️' },
        { value: 'dark', label: 'Темна', icon: '🌙' }
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

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--platform-text-primary)', marginBottom: '1.5rem' }}>🛠️ Загальні налаштування сайту</h2>
            
            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}
            
            <button 
                onClick={handleSave} 
                disabled={saving}
                style={{
                    ...styles.button, 
                    width: '100%', 
                    padding: '12px 24px', 
                    background: saving ? 'var(--platform-text-secondary)' : 'var(--platform-accent)', 
                    color: 'var(--platform-accent-text)', 
                    fontSize: '16px',
                    fontWeight: '600',
                    opacity: saving ? 0.7 : 1,
                    marginBottom: '1.5rem'
                }}
            >
                {saving ? '⏳ Збереження...' : '💾 Зберегти Загальні Налаштування'}
            </button>

            <div style={styles.card}>
                <h4 style={styles.heading}>
                    📋 Основна Інформація
                </h4>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={styles.label}>Назва сайту:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={styles.input}
                        placeholder="Введіть назву сайту"
                    />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={styles.label}>Статус:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={styles.input}
                    >
                        <option value="draft">Чернетка</option>
                        <option value="published">Опубліковано</option>
                    </select>
                </div>
            </div>

            <div style={styles.card}>
                <h4 style={styles.heading}>
                    ✨ Дизайн та Тема
                </h4>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={styles.label}>Режим теми:</label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                        {siteModes.map(mode => (
                            <button
                                key={mode.value}
                                onClick={() => setSiteMode(mode.value)}
                                style={{
                                    ...styles.button,
                                    flex: 1,
                                    background: siteMode === mode.value ? 'var(--platform-accent)' : 'var(--platform-bg)',
                                    color: siteMode === mode.value ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
                                    border: siteMode === mode.value ? 'none' : '1px solid var(--platform-border-color)',
                                    borderRadius: '8px',
                                }}
                            >
                                {mode.icon} {mode.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={styles.label}>Акцентний колір:</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        {siteAccents.map(accent => (
                            <div 
                                key={accent.value} 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    gap: '0.5rem' 
                                }}
                            >
                                <button
                                    onClick={() => setSiteAccent(accent.value)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        border: siteAccent === accent.value 
                                            ? `4px solid ${accent.color}` 
                                            : '2px solid var(--platform-border-color)',
                                        boxShadow: siteAccent === accent.value 
                                            ? `0 0 0 4px var(--platform-card-bg)` 
                                            : 'none',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: accent.color,
                                        padding: 0,
                                    }}
                                    title={accent.label}
                                />
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    color: siteAccent === accent.value ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                    textAlign: 'center',
                                    fontWeight: siteAccent === accent.value ? '600' : '400'
                                }}>
                                    {accent.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div style={styles.card}>
                <h4 style={styles.heading}>
                    #️⃣ Теги
                </h4>
                <p style={{ color: 'var(--platform-text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Виберіть теги, які найкраще описують ваш сайт.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {allTags.map(tag => (
                        <label 
                            key={tag.id} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: selectedTags.has(tag.id) ? 'var(--platform-accent)' : 'var(--platform-bg)',
                                color: selectedTags.has(tag.id) ? 'var(--platform-accent-text)' : 'var(--platform-text-primary)',
                                border: `1px solid ${selectedTags.has(tag.id) ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
                                borderRadius: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontWeight: '500',
                                whiteSpace: 'nowrap',
                                boxShadow: selectedTags.has(tag.id) ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
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
                    <p style={{ 
                        color: 'var(--platform-text-secondary)', 
                        fontStyle: 'italic', 
                        padding: '1rem',
                        background: 'var(--platform-bg)',
                        borderRadius: '4px'
                    }}>
                        Теги відсутні. Створіть теги в адмін-панелі платформи.
                    </p>
                )}
            </div>
        </div>
    );
};

export default GeneralSettingsTab;