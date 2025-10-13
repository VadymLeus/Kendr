// frontend/src/templates/SimpleBio/EditSitePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const EditSitePage = () => {
    const { site_path } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState({ headerTitle: '', aboutText: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/sites/${site_path}`);
                setContent(response.data.content);
            } catch (err) {
                setError('Не вдалося завантажити дані сайту для редагування.');
            } finally {
                setLoading(false);
            }
        };
        fetchSiteData();
    }, [site_path]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContent(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.put(`/sites/${site_path}/update`, { contentKey: 'headerTitle', contentValue: content.headerTitle });
            await apiClient.put(`/sites/${site_path}/update`, { contentKey: 'aboutText', contentValue: content.aboutText });

            alert('Сайт успішно оновлено!');
            navigate(`/site/${site_path}`);
        } catch (err) {
            setError('Помилка під час оновлення. Переконайтеся, що ви авторизовані.');
            console.error(err);
        }
    };

    if (loading) return <div>Завантаження редактора...</div>;
    if (error) return <div>{error}</div>;
    
    return (
        <div>
            <h2>Редагування сайту: {site_path}</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Заголовок:</label><br/>
                    <input 
                        type="text" 
                        name="headerTitle" 
                        value={content.headerTitle || ''} 
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Текст "Про себе":</label><br/>
                    <textarea 
                        name="aboutText" 
                        value={content.aboutText || ''} 
                        onChange={handleChange}
                        rows="10"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    ></textarea>
                </div>
                <button type="submit">Зберегти зміни</button>
            </form>
        </div>
    );
};

export default EditSitePage;