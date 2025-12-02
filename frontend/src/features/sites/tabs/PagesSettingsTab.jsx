// frontend/src/features/sites/tabs/PagesSettingsTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from "../../../services/api";
import { toast } from 'react-toastify';
import { useConfirm } from '../../../hooks/useConfirm';

const PageModal = ({ isOpen, onClose, onSave, page, siteId, onPageUpdate, onSavingChange }) => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [showSeo, setShowSeo] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setName(page ? page.name : '');
        setSlug(page ? page.slug : '');
        setSeoTitle(page ? (page.seo_title || '') : '');
        setSeoDescription(page ? (page.seo_description || '') : '');
        setShowSeo(false);
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

        if (onSavingChange) onSavingChange(true);
        setLoading(true);

        try {
            const payload = { 
                name, 
                slug,
                seo_title: seoTitle,
                seo_description: seoDescription
            };

            if (page) {
                await apiClient.put(`/pages/${page.id}/settings`, payload);
                toast.success(`✅ Сторінку "${name}" оновлено!`);
            } else {
                await apiClient.post(`/sites/${siteId}/pages`, payload);
                toast.success(`✅ Сторінку "${name}" створено!`);
            }
            onSave();
            if (onPageUpdate) onPageUpdate();
        } catch (err) {
            console.error('Помилка:', err);
            toast.error(err.response?.data?.message || 'Помилка збереження');
        } finally {
            setLoading(false);
            setTimeout(() => {
                if (onSavingChange) onSavingChange(false);
            }, 500);
        }
    };

    if (!isOpen) return null;

    const buttonStyle = {
        padding: '10px 20px', 
        border: 'none', 
        borderRadius: '8px',
        cursor: 'pointer', 
        fontSize: '14px', 
        fontWeight: '500',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const cancelButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        border: '1px solid var(--platform-border-color)'
    };

    const cancelButtonHoverStyle = {
        background: 'var(--platform-hover-bg)',
        borderColor: 'var(--platform-accent)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };

    const submitButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)'
    };

    const submitButtonHoverStyle = {
        background: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };

    const inputStyle = {
        width: '100%', 
        padding: '0.75rem', 
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px', 
        fontSize: '1rem', 
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)', 
        marginBottom: '0.5rem',
        transition: 'all 0.2s ease'
    };

    const inputHoverStyle = {
        borderColor: 'var(--platform-accent)',
        boxShadow: '0 0 0 1px var(--platform-accent)'
    };

    const labelStyle = {
        display: 'block', 
        marginBottom: '0.5rem', 
        color: 'var(--platform-text-primary)', 
        fontWeight: '500', 
        fontSize: '0.9rem'
    };

    const seoSectionStyle = {
        marginTop: '1rem',
        borderTop: '1px solid var(--platform-border-color)',
        paddingTop: '1rem'
    };
    
    const toggleSeoBtnStyle = {
        background: 'none',
        border: 'none',
        color: 'var(--platform-accent)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        padding: 0,
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'color 0.2s ease',
        fontWeight: '500'
    };

    const toggleSeoBtnHoverStyle = {
        color: 'var(--platform-accent-hover)'
    };

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

    const handleMouseOver = (element, hoverStyle) => {
        Object.assign(element.style, hoverStyle);
    };

    const handleMouseOut = (element, originalStyle) => {
        Object.assign(element.style, originalStyle);
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
                            required
                            onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
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
                            required
                            onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
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

                    <div style={seoSectionStyle}>
                        <button 
                            type="button" 
                            onClick={() => setShowSeo(!showSeo)}
                            style={toggleSeoBtnStyle}
                            onMouseOver={(e) => handleMouseOver(e.target, toggleSeoBtnHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, toggleSeoBtnStyle)}
                        >
                            {showSeo ? '▼' : '▶'} SEO Налаштування (для Google)
                        </button>

                        {showSeo && (
                            <div className="animation-fade-in">
                                <div style={{marginBottom: '1rem'}}>
                                    <label style={labelStyle}>
                                        SEO Заголовок <small style={{fontWeight:400, color:'gray'}}>(Meta Title)</small>:
                                    </label>
                                    <input 
                                        type="text" 
                                        value={seoTitle} 
                                        onChange={(e) => setSeoTitle(e.target.value)} 
                                        style={inputStyle} 
                                        placeholder={name}
                                        disabled={loading}
                                        onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                                        onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                                    />
                                </div>
                                <div style={{marginBottom: '1rem'}}>
                                    <label style={labelStyle}>
                                        SEO Опис <small style={{fontWeight:400, color:'gray'}}>(Meta Description)</small>:
                                    </label>
                                    <textarea 
                                        value={seoDescription} 
                                        onChange={(e) => setSeoDescription(e.target.value)} 
                                        style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} 
                                        placeholder="Короткий опис сторінки для пошукової видачі..."
                                        disabled={loading}
                                        onMouseOver={(e) => handleMouseOver(e.target, {...inputStyle, minHeight: '80px', resize: 'vertical', ...inputHoverStyle})}
                                        onMouseOut={(e) => handleMouseOut(e.target, {...inputStyle, minHeight: '80px', resize: 'vertical'})}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: '10px', 
                        marginTop: '1.5rem'
                    }}>
                        <button 
                            type="button" 
                            style={cancelButtonStyle}
                            onClick={onClose}
                            disabled={loading}
                            onMouseOver={(e) => !loading && handleMouseOver(e.target, cancelButtonHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, {...cancelButtonStyle, opacity: loading ? 0.6 : 1})}
                        >
                            Скасувати
                        </button>
                        <button 
                            type="submit" 
                            style={{...submitButtonStyle, opacity: loading ? 0.6 : 1}}
                            disabled={loading}
                            onMouseOver={(e) => !loading && handleMouseOver(e.target, submitButtonHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, {...submitButtonStyle, opacity: loading ? 0.6 : 1})}
                        >
                            {loading ? '⏳' : page ? '💾 Зберегти' : '➕ Створити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PagesSettingsTab = ({ siteId, onEditPage, onPageUpdate, onEditFooter, onEditHeader, onSavingChange }) => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { confirm } = useConfirm();

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

        const isConfirmed = await confirm({
            title: "Видалити сторінку?",
            message: `Ви впевнені, що хочете видалити сторінку "${page.name}"?`,
            type: "danger",
            confirmLabel: "Так, видалити"
        });

        if (!isConfirmed) return;

        if (onSavingChange) onSavingChange(true);

        try {
            await apiClient.delete(`/pages/${page.id}`);
            fetchPages();
            if (onPageUpdate) onPageUpdate();
            toast.success(`🗑️ Сторінку "${page.name}" успішно видалено`);
        } catch (err) {
            console.error('Помилка видалення сторінки:', err);
            toast.error('Не вдалося видалити сторінку');
        } finally {
            setTimeout(() => {
                if (onSavingChange) onSavingChange(false);
            }, 500);
        }
    };

    const handleSetHome = async (pageId, pageName) => {
        if (onSavingChange) onSavingChange(true);

        try {
            await apiClient.post(`/pages/${pageId}/set-home`);
            fetchPages();
            if (onPageUpdate) onPageUpdate();
            toast.success(`🏠 Сторінку "${pageName}" встановлено як головну`);
        } catch (err) {
            console.error('Помилка встановлення головної сторінки:', err);
            toast.error('Не вдалося встановити головну сторінку');
        } finally {
            setTimeout(() => {
                if (onSavingChange) onSavingChange(false);
            }, 500);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState(null);

    const buttonStyle = {
        padding: '8px 16px', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer',
        fontSize: '12px', 
        fontWeight: '500', 
        transition: 'all 0.2s ease', 
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const editorButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        border: '1px solid var(--platform-border-color)'
    };

    const editorButtonHoverStyle = {
        background: 'var(--platform-hover-bg)',
        borderColor: 'var(--platform-accent)',
        color: 'var(--platform-accent)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };

    const settingsButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        border: '1px solid var(--platform-border-color)'
    };

    const settingsButtonHoverStyle = {
        background: 'var(--platform-hover-bg)',
        borderColor: 'var(--platform-accent)',
        color: 'var(--platform-accent)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };

    const homeButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        border: '1px solid var(--platform-border-color)'
    };

    const homeButtonHoverStyle = {
        background: 'var(--platform-warning)',
        color: 'white',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(237, 137, 54, 0.2)'
    };

    const deleteButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-danger)',
        color: 'white'
    };

    const deleteButtonHoverStyle = {
        background: 'var(--platform-danger-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(229, 62, 62, 0.2)'
    };

    const globalEditButtonStyle = {
        ...buttonStyle,
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)'
    };

    const globalEditButtonHoverStyle = {
        background: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };

    const createButtonStyle = {
        padding: '10px 20px', 
        backgroundColor: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)', 
        border: 'none',
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontSize: '14px',
        fontWeight: '600', 
transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    };

    const createButtonHoverStyle = {
        backgroundColor: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
    };

    const handleMouseOver = (element, hoverStyle) => {
        Object.assign(element.style, hoverStyle);
    };

    const handleMouseOut = (element, originalStyle) => {
        Object.assign(element.style, originalStyle);
    };

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
                onSavingChange={onSavingChange}
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
                    style={createButtonStyle}
                    onClick={handleOpenCreate}
                    onMouseOver={(e) => handleMouseOver(e.target, createButtonHoverStyle)}
                    onMouseOut={(e) => handleMouseOut(e.target, createButtonStyle)}
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
                                                    style={editorButtonStyle}
                                                    onClick={() => onEditPage(page.id)}
                                                    title="Редагувати вміст"
                                                    onMouseOver={(e) => handleMouseOver(e.target, editorButtonHoverStyle)}
                                                    onMouseOut={(e) => handleMouseOut(e.target, editorButtonStyle)}
                                                >
                                                    ✏️ Редактор
                                                </button>
                                                <button 
                                                    style={settingsButtonStyle}
                                                    onClick={() => handleOpenEdit(page)}
                                                    title="Налаштування сторінки"
                                                    onMouseOver={(e) => handleMouseOver(e.target, settingsButtonHoverStyle)}
                                                    onMouseOut={(e) => handleMouseOut(e.target, settingsButtonStyle)}
                                                >
                                                    ⚙️ Налаш.
                                                </button>
                                                {!page.is_homepage && (
                                                    <>
                                                        <button 
                                                            style={homeButtonStyle}
                                                            onClick={() => handleSetHome(page.id, page.name)}
                                                            title="Зробити головною сторінкою"
                                                            onMouseOver={(e) => handleMouseOver(e.target, homeButtonHoverStyle)}
                                                            onMouseOut={(e) => handleMouseOut(e.target, homeButtonStyle)}
                                                        >
                                                            🏠 Головна
                                                        </button>
                                                        <button 
                                                            style={deleteButtonStyle}
                                                            onClick={() => handleDelete(page)}
                                                            title="Видалити сторінку"
                                                            onMouseOver={(e) => handleMouseOver(e.target, deleteButtonHoverStyle)}
                                                            onMouseOut={(e) => handleMouseOut(e.target, deleteButtonStyle)}
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
                                                    style={globalEditButtonStyle}
                                                    onClick={onEditHeader}
                                                    title="Редагувати вміст хедера"
                                                    onMouseOver={(e) => handleMouseOver(e.target, globalEditButtonHoverStyle)}
                                                    onMouseOut={(e) => handleMouseOut(e.target, globalEditButtonStyle)}
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
                                                    style={globalEditButtonStyle}
                                                    onClick={onEditFooter}
                                                    title="Редагувати вміст футера"
                                                    onMouseOver={(e) => handleMouseOver(e.target, globalEditButtonHoverStyle)}
                                                    onMouseOut={(e) => handleMouseOut(e.target, globalEditButtonStyle)}
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