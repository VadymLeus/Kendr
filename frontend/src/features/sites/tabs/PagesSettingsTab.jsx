// frontend/src/features/sites/tabs/PagesSettingsTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../services/api';

// Модальне вікно для створення або редагування сторінки
const PageModal = ({ isOpen, onClose, onSave, page, siteId }) => {
    const [name, setName] = useState(page ? page.name : '');
    const [slug, setSlug] = useState(page ? page.slug : '');
    const [error, setError] = useState('');

    useEffect(() => {
        setName(page ? page.name : '');
        setSlug(page ? page.slug : '');
        setError('');
    }, [page, isOpen]);

    const handleSlugChange = (e) => {
        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name || !slug) {
            setError('Назва та Slug є обов’язковими.');
            return;
        }

        try {
            if (page) {
                await apiClient.put(`/pages/${page.id}/settings`, { name, slug });
            } else {
                await apiClient.post(`/sites/${siteId}/pages`, { name, slug });
            }
            onSave();
        } catch (err) {
            setError(err.response?.data?.message || 'Сталася помилка.');
        }
    };

    if (!isOpen) return null;

    const modalOverlayStyle = { 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.7)', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', zIndex: 2100
    };
    const modalContentStyle = { 
        background: 'var(--site-card-bg)', padding: '1.5rem', 
        borderRadius: '12px', width: '90%', maxWidth: '500px', 
        border: '1px solid var(--site-border-color)', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
    };
    const inputStyle = {
        width: '100%', padding: '0.75rem', border: '1px solid var(--site-border-color)',
        borderRadius: '4px', fontSize: '1rem', background: 'var(--site-card-bg)',
        color: 'var(--site-text-primary)', marginBottom: '0.5rem'
    };
    const labelStyle = {
        display: 'block', marginBottom: '0.5rem', color: 'var(--site-text-primary)', fontWeight: '500'
    };
    const buttonStyle = {
        padding: '10px 20px', border: 'none', borderRadius: '4px',
        cursor: 'pointer', fontSize: '14px', fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <h3 style={{color: 'var(--site-text-primary)', marginBottom: '1.5rem'}}>
                    {page ? 'Налаштування сторінки' : 'Створити сторінку'}
                </h3>
                {error && <p style={{color: 'var(--site-danger)', marginBottom: '1rem'}}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '1rem'}}>
                        <label style={labelStyle}>Назва сторінки:</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            style={inputStyle} 
                            placeholder="Про нас" 
                        />
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                        <label style={labelStyle}>Slug (шлях):</label>
                        <input 
                            type="text" 
                            value={slug} 
                            onChange={handleSlugChange} 
                            style={inputStyle} 
                            placeholder="about-us" 
                        />
                        <small style={{color: 'var(--site-text-secondary)', fontSize: '0.8rem'}}>
                            Дозволені символи: a-z, 0-9, -
                        </small>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem'}}>
                        <button 
                            type="button" 
                            style={{
                                ...buttonStyle,
                                background: 'var(--site-card-bg)',
                                color: 'var(--site-text-primary)',
                                border: '1px solid var(--site-border-color)'
                            }}
                            onClick={onClose}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = 'var(--site-accent)';
                                e.target.style.color = 'var(--site-accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = 'var(--site-border-color)';
                                e.target.style.color = 'var(--site-text-primary)';
                            }}
                        >
                            Скасувати
                        </button>
                        <button 
                            type="submit" 
                            style={{
                                ...buttonStyle,
                                background: 'var(--site-accent)',
                                color: 'var(--site-accent-text)'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'var(--site-accent-hover)'}
                            onMouseLeave={(e) => e.target.style.background = 'var(--site-accent)'}
                        >
                            {page ? 'Зберегти' : 'Створити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PagesSettingsTab = ({ siteId, onEditPage }) => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState(null);

    const fetchPages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/sites/${siteId}/pages`);
            setPages(response.data);
            setError('');
        } catch (err) {
            setError('Не вдалося завантажити сторінки.');
        } finally {
            setLoading(false);
        }
    }, [siteId]);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    const handleOpenCreate = () => {
        setEditingPage(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (page) => {
        setEditingPage(page);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPage(null);
    };

    const handleSaveSuccess = () => {
        handleCloseModal();
        fetchPages();
    };

    const handleDelete = async (page) => {
        if (page.is_homepage) {
            alert('Неможливо видалити головну сторінку.');
            return;
        }
        if (!window.confirm(`Ви впевнені, що хочете видалити сторінку "${page.name}"?`)) {
            return;
        }
        try {
            await apiClient.delete(`/pages/${page.id}`);
            fetchPages();
        } catch (err) {
            alert(err.response?.data?.message || 'Помилка під час видалення.');
        }
    };

    const handleSetHome = async (pageId) => {
        try {
            await apiClient.post(`/pages/${pageId}/set-home`);
            fetchPages();
        } catch (err) {
            alert('Помилка під час встановлення головної сторінки.');
        }
    };

    const cardStyle = {
        background: 'var(--site-card-bg)', padding: '1.5rem 2rem',
        borderRadius: '12px', border: '1px solid var(--site-border-color)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    };
    const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem' };
    const thStyle = { 
        textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '2px solid var(--site-border-color)',
        color: 'var(--site-text-secondary)', fontWeight: '600'
    };
    const tdStyle = { 
        textAlign: 'left', padding: '1rem', borderBottom: '1px solid var(--site-border-color)',
        color: 'var(--site-text-primary)'
    };
    const buttonStyle = {
        padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer',
        fontSize: '12px', fontWeight: '500', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
    };

    return (
        <div style={cardStyle}>
            <PageModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSuccess}
                page={editingPage}
                siteId={siteId}
            />

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h2 style={{ color: 'var(--site-text-primary)', margin: 0 }}>
                    Керування сторінками
                </h2>
                <button 
                    style={{
                        padding: '10px 20px', backgroundColor: 'var(--site-accent)',
                        color: 'var(--site-accent-text)', border: 'none',
                        borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
                        fontWeight: '600', transition: 'background-color 0.2s ease'
                    }}
                    onClick={handleOpenCreate}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--site-accent-hover)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--site-accent)'}
                >
                    + Додати сторінку
                </button>
            </div>

            {loading && <p style={{color: 'var(--site-text-secondary)'}}>Завантаження сторінок...</p>}
            {error && <p style={{color: 'var(--site-danger)'}}>{error}</p>}
            
            {!loading && !error && (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Назва</th>
                            <th style={thStyle}>Шлях (Slug)</th>
                            <th style={thStyle}>Статус</th>
                            <th style={thStyle}>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map(page => (
                            <tr key={page.id}>
                                <td style={tdStyle}>{page.name}</td>
                                <td style={tdStyle}>/{page.slug}</td>
                                <td style={tdStyle}>
                                    {page.is_homepage ? (
                                        <span style={{color: 'var(--site-accent)', fontWeight: 'bold'}}>🏠 Головна</span>
                                    ) : (
                                        'Звичайна'
                                    )}
                                </td>
                                <td style={{...tdStyle, display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                    <button 
                                        style={{
                                            ...buttonStyle,
                                            background: 'var(--site-card-bg)',
                                            color: 'var(--site-text-primary)',
                                            border: '1px solid var(--site-border-color)'
                                        }}
                                        onClick={() => onEditPage(page.id)}
                                        title="Редагувати вміст"
                                    >
                                        ✏️ Редактор
                                    </button>
                                    <button 
                                        style={{
                                            ...buttonStyle,
                                            background: 'var(--site-card-bg)',
                                            color: 'var(--site-text-primary)',
                                            border: '1px solid var(--site-border-color)'
                                        }}
                                        onClick={() => handleOpenEdit(page)}
                                        title="Налаштування сторінки"
                                    >
                                        ⚙️ Налаш.
                                    </button>
                                    {!page.is_homepage && (
                                        <>
                                            <button 
                                                style={{
                                                    ...buttonStyle,
                                                    background: 'var(--site-card-bg)',
                                                    color: 'var(--site-text-primary)',
                                                    border: '1px solid var(--site-border-color)'
                                                }}
                                                onClick={() => handleSetHome(page.id)}
                                                title="Зробити головною сторінкою"
                                            >
                                                🏠 Головна
                                            </button>
                                            <button 
                                                style={{
                                                    ...buttonStyle,
                                                    background: 'var(--site-danger)',
                                                    color: 'white'
                                                }}
                                                onClick={() => handleDelete(page)}
                                                title="Видалити сторінку"
                                            >
                                                ❌
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PagesSettingsTab;
