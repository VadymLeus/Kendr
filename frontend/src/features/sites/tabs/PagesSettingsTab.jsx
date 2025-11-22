// frontend/src/features/sites/tabs/PagesSettingsTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from "../../../services/api";
import { toast } from 'react-toastify';

const PageModal = ({ isOpen, onClose, onSave, page, siteId, onPageUpdate }) => {
    const [name, setName] = useState(page ? page.name : '');
    const [slug, setSlug] = useState(page ? page.slug : '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setName(page ? page.name : '');
        setSlug(page ? page.slug : '');
    }, [page, isOpen]);

    const handleSlugChange = (e) => {
        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !slug) {
            toast.warning('Назва та Slug є обовязковими.');
            return;
        }

        setLoading(true);
        try {
            if (page) {
                await apiClient.put(`/pages/${page.id}/settings`, { name, slug });
                toast.success(`✅ Сторінку "${name}" успішно оновлено!`);
            } else {
                await apiClient.post(`/sites/${siteId}/pages`, { name, slug });
                toast.success(`✅ Сторінку "${name}" успішно створено!`);
            }
            onSave();
            if (onPageUpdate) onPageUpdate();
        } catch (err) {
            console.error('Помилка збереження сторінки:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalOverlayStyle = { 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.7)', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', zIndex: 2100
    };
    const modalContentStyle = { 
        background: 'var(--platform-card-bg)', padding: '1.5rem', 
        borderRadius: '12px', width: '90%', maxWidth: '500px', 
        border: '1px solid var(--platform-border-color)', 
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
    };
    const inputStyle = {
        width: '100%', padding: '0.75rem', border: '1px solid var(--platform-border-color)',
        borderRadius: '4px', fontSize: '1rem', background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)', marginBottom: '0.5rem',
        transition: 'border-color 0.2s ease'
    };
    const labelStyle = {
        display: 'block', marginBottom: '0.5rem', color: 'var(--platform-text-primary)', 
        fontWeight: '500', fontSize: '0.9rem'
    };
    const buttonStyle = {
        padding: '10px 20px', border: 'none', borderRadius: '4px',
        cursor: 'pointer', fontSize: '14px', fontWeight: '500',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <h3 style={{
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1.5rem',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {page ? '⚙️ Налаштування сторінки' : '📄 Створити сторінку'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={labelStyle}>Назва сторінки:</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            style={inputStyle} 
                            placeholder="Про нас" 
                            disabled={loading}
                        />
                    </div>
                    <div style={{marginBottom: '1.5rem'}}>
                        <label style={labelStyle}>Slug (шлях):</label>
                        <input 
                            type="text" 
                            value={slug} 
                            onChange={handleSlugChange} 
                            style={inputStyle} 
                            placeholder="about-us" 
                            disabled={loading}
                        />
                        <small style={{
                            color: 'var(--platform-text-secondary)', 
                            fontSize: '0.8rem',
                            display: 'block',
                            marginTop: '0.25rem'
                        }}>
                            Дозволені символи: a-z, 0-9, -
                        </small>
                    </div>
                    <div style={{
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: '10px', 
                        marginTop: '1.5rem'
                    }}>
                        <button 
                            type="button" 
                            style={{
                                ...buttonStyle,
                                background: 'var(--platform-card-bg)',
                                color: 'var(--platform-text-primary)',
                                border: '1px solid var(--platform-border-color)',
                                opacity: loading ? 0.6 : 1
                            }}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Скасувати
                        </button>
                        <button 
                            type="submit" 
                            style={{
                                ...buttonStyle,
                                background: 'var(--platform-accent)',
                                color: 'var(--platform-accent-text)',
                                opacity: loading ? 0.6 : 1
                            }}
                            disabled={loading}
                        >
                            {loading ? '⏳' : page ? '💾 Зберегти' : '➕ Створити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PagesSettingsTab = ({ siteId, onEditPage, onPageUpdate, onEditFooter, onEditHeader }) => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/sites/${siteId}/pages`);
            setPages(response.data);
        } catch (err) {
            console.error('Помилка завантаження сторінок:', err);
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
        if (onPageUpdate) onPageUpdate();
    };

    const handleDelete = async (page) => {
        if (page.is_homepage) {
            toast.warning('Неможливо видалити головну сторінку.');
            return;
        }
        if (!window.confirm(`Ви впевнені, що хочете видалити сторінку "${page.name}"?`)) {
            return;
        }
        try {
            await apiClient.delete(`/pages/${page.id}`);
            fetchPages();
            if (onPageUpdate) onPageUpdate();
            toast.success(`🗑️ Сторінку "${page.name}" успішно видалено`);
        } catch (err) {
            console.error('Помилка видалення сторінки:', err);
        }
    };

    const handleSetHome = async (pageId, pageName) => {
        try {
            await apiClient.post(`/pages/${pageId}/set-home`);
            fetchPages();
            if (onPageUpdate) onPageUpdate();
            toast.success(`🏠 Сторінку "${pageName}" встановлено як головну`);
        } catch (err) {
            console.error('Помилка встановлення головної сторінки:', err);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState(null);

    const styles = {
        card: {
            background: 'var(--platform-card-bg)', 
            padding: '1.5rem 2rem',
            borderRadius: '12px', 
            border: '1px solid var(--platform-border-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        },
        table: { 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginTop: '1.5rem' 
        },
        th: { 
            textAlign: 'left', 
            padding: '0.75rem 1rem', 
            borderBottom: '2px solid var(--platform-border-color)',
            color: 'var(--platform-text-secondary)', 
            fontWeight: '600',
            fontSize: '0.9rem'
        },
        td: { 
            textAlign: 'left', 
            padding: '1rem', 
            borderBottom: '1px solid var(--platform-border-color)',
            color: 'var(--platform-text-primary)',
            fontSize: '0.9rem'
        },
        button: {
            padding: '6px 12px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '12px', 
            fontWeight: '500', 
            transition: 'all 0.2s ease', 
            whiteSpace: 'nowrap'
        },
        createButton: {
            padding: '10px 20px', 
            backgroundColor: 'var(--platform-accent)',
            color: 'var(--platform-accent-text)', 
            border: 'none',
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontSize: '14px',
            fontWeight: '600', 
            transition: 'background-color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        }
    };

    return (
        <div style={styles.card}>
            <PageModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveSuccess}
                page={editingPage}
                siteId={siteId}
                onPageUpdate={onPageUpdate} 
            />

            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem'
            }}>
                <h2 style={{ 
                    color: 'var(--platform-text-primary)', 
                    margin: 0,
                    fontSize: '1.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    📄 Керування сторінками
                </h2>
                <button 
                    style={styles.createButton}
                    onClick={handleOpenCreate}
                >
                    ➕ Додати сторінку
                </button>
            </div>

            {loading && <p style={{
                color: 'var(--platform-text-secondary)',
                textAlign: 'center',
                padding: '2rem'
            }}>⏳ Завантаження сторінок...</p>}
            
            {!loading && (
                <>
                    {pages.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            color: 'var(--platform-text-secondary)',
                            border: '2px dashed var(--platform-border-color)',
                            borderRadius: '8px',
                            marginTop: '1rem'
                        }}>
                            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📄</div>
                            <h3 style={{color: 'var(--platform-text-primary)', marginBottom: '0.5rem'}}>
                                Немає сторінок
                            </h3>
                            <p>Створіть першу сторінку для вашого сайту</p>
                        </div>
                    ) : (
                        <>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Назва</th>
                                        <th style={styles.th}>Шлях (Slug)</th>
                                        <th style={styles.th}>Статус</th>
                                        <th style={styles.th}>Дії</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pages.map(page => (
                                        <tr key={page.id}>
                                            <td style={styles.td}>
                                                <strong>{page.name}</strong>
                                            </td>
                                            <td style={styles.td}>/{page.slug}</td>
                                            <td style={styles.td}>
                                                {page.is_homepage ? (
                                                    <span style={{
                                                        color: 'var(--platform-accent)', 
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}>🏠 Головна</span>
                                                ) : (
                                                    'Звичайна'
                                                )}
                                            </td>
                                            <td style={{
                                                ...styles.td, 
                                                display: 'flex', 
                                                gap: '8px', 
                                                flexWrap: 'wrap'
                                            }}>
                                                <button 
                                                    style={{
                                                        ...styles.button,
                                                        background: 'var(--platform-card-bg)',
                                                        color: 'var(--platform-text-primary)',
                                                        border: '1px solid var(--platform-border-color)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                    onClick={() => onEditPage(page.id)}
                                                    title="Редагувати вміст"
                                                >
                                                    ✏️ Редактор
                                                </button>
                                                <button 
                                                    style={{
                                                        ...styles.button,
                                                        background: 'var(--platform-card-bg)',
                                                        color: 'var(--platform-text-primary)',
                                                        border: '1px solid var(--platform-border-color)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
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
                                                                ...styles.button,
                                                                background: 'var(--platform-card-bg)',
                                                                color: 'var(--platform-text-primary)',
                                                                border: '1px solid var(--platform-border-color)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem'
                                                            }}
                                                            onClick={() => handleSetHome(page.id, page.name)}
                                                            title="Зробити головною сторінкою"
                                                        >
                                                            🏠 Головна
                                                        </button>
                                                        <button 
                                                            style={{
                                                                ...styles.button,
                                                                background: 'var(--platform-danger)',
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem'
                                                            }}
                                                            onClick={() => handleDelete(page)}
                                                            title="Видалити сторінку"
                                                        >
                                                            🗑️ Видалити
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ 
                                    color: 'var(--platform-text-secondary)', 
                                    fontSize: '0.9rem', 
                                    textTransform: 'uppercase', 
                                    borderBottom: '1px solid var(--platform-border-color)',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '0'
                                }}>
                                    Глобальні області (на всіх сторінках)
                                </h4>
                                
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td style={styles.td}>
                                                <strong>🔝 Глобальний Хедер</strong>
                                            </td>
                                            <td style={styles.td}>/ (header)</td>
                                            <td style={styles.td}>
                                                <span style={{ color: 'var(--platform-text-secondary)', fontStyle: 'italic' }}>
                                                    Наскрізний блок
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <button 
                                                    style={{
                                                        ...styles.button,
                                                        background: 'var(--platform-accent)',
                                                        color: 'var(--platform-accent-text)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                    onClick={onEditHeader}
                                                    title="Редагувати вміст хедера"
                                                >
                                                    🛠 Редагувати Хедер
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.td}>
                                                <strong>🔻 Глобальний Футер</strong>
                                            </td>
                                            <td style={styles.td}>/ (footer)</td>
                                            <td style={styles.td}>
                                                <span style={{ color: 'var(--platform-text-secondary)', fontStyle: 'italic' }}>
                                                    Наскрізний блок
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <button 
                                                    style={{
                                                        ...styles.button,
                                                        background: 'var(--platform-accent)',
                                                        color: 'var(--platform-accent-text)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                    onClick={onEditFooter}
                                                    title="Редагувати вміст футера"
                                                >
                                                    🛠 Редагувати Футер
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default PagesSettingsTab;