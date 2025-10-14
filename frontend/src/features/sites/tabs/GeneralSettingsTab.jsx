// frontend/src/features/sites/tabs/GeneralSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/api';

const GeneralSettingsTab = ({ siteData }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState(siteData.title);
    const [status, setStatus] = useState(siteData.status);
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
            await apiClient.put(`/sites/${siteData.site_path}/settings`, {
                title,
                status,
                tags: Array.from(selectedTags)
            });
            alert('Налаштування успішно збережено!');
        } catch (err) {
            setError('Не вдалося зберегти налаштування.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h2>Загальні налаштування</h2>
            
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Назва сайту:
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Статус:
                </label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ padding: '0.5rem' }}
                >
                    <option value="draft">Чернетка</option>
                    <option value="published">Опубліковано</option>
                </select>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Теги:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {allTags.map(tag => (
                        <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#242060',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: saving ? 'not-allowed' : 'pointer'
                }}
            >
                {saving ? 'Збереження...' : 'Зберегти налаштування'}
            </button>
        </div>
    );
};

export default GeneralSettingsTab;