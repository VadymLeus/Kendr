// frontend/src/features/sites/tabs/GeneralSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
                site_theme_accent: siteAccent
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
        { value: 'green', label: 'Зелений', color: '#2f855a' }
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

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Link to={`/site/${siteData.site_path}`} className="btn btn-secondary">
                    Повернутися на сайт
                </Link>
            </div>

            <h2 style={{ color: 'var(--platform-text-primary)' }}>Загальні налаштування</h2>
            
            {error && (
                <div style={{ 
                    color: 'var(--platform-danger)', 
                    marginBottom: '1rem',
                    padding: '10px',
                    backgroundColor: '#fff2f0',
                    border: '1px solid var(--platform-danger)',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}
            
            <div className="card" style={{marginBottom: '1.5rem'}}>
                <h4 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>Основні налаштування</h4>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        color: 'var(--platform-text-primary)'
                    }}>
                        Назва сайту:
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        color: 'var(--platform-text-primary)'
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

            <div className="card" style={{marginBottom: '1.5rem'}}>
                <h4 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>Дизайн сайту</h4>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        color: 'var(--platform-text-primary)'
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
                        color: 'var(--platform-text-primary)'
                    }}>
                        Акцентний колір:
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        {siteAccents.map(accent => (
                            <button
                                key={accent.value}
                                onClick={() => setSiteAccent(accent.value)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    border: siteAccent === accent.value ? '3px solid var(--platform-accent)' : '3px solid transparent',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: accent.color
                                }}
                                title={accent.label}
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="card" style={{marginBottom: '1.5rem'}}>
                <h4 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>Теги</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {allTags.map(tag => (
                        <label 
                            key={tag.id} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.25rem',
                                color: 'var(--platform-text-primary)'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedTags.has(tag.id)}
                                onChange={() => handleTagChange(tag.id)}
                            />
                            {tag.name}
                        </label>
                    ))}
                </div>
            </div>
            
            <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn btn-primary"
                style={{width: '100%'}}
            >
                {saving ? 'Збереження...' : 'Зберегти зміни'}
            </button>
        </div>
    );
};

export default GeneralSettingsTab;