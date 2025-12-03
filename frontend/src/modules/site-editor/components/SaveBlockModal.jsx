// frontend/src/modules/site-editor/components/SaveBlockModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../common/services/api';
import { useConfirm } from '../../../common/hooks/useConfirm';
import { toast } from 'react-toastify';

const SaveBlockModal = ({ isOpen, onClose, onSave, originBlockInfo }) => {
    const [name, setName] = useState('');
    const [existingBlocks, setExistingBlocks] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const { confirm } = useConfirm();

    useEffect(() => {
        if (isOpen) {
            setName('');
            setIsChecking(true);
            apiClient.get('/saved-blocks')
                .then(res => {
                    setExistingBlocks(res.data);
                })
                .catch(err => console.error("Failed to check blocks", err))
                .finally(() => setIsChecking(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSaveAsNew = async (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        
        if (!trimmedName) {
            toast.warning("Введіть назву блоку");
            return;
        }

        const duplicate = existingBlocks.find(b => b.name.toLowerCase() === trimmedName.toLowerCase());

        if (duplicate) {
            const isConfirmed = await confirm({
                title: "Блок вже існує",
                message: `Блок з назвою "${trimmedName}" вже є у вашій бібліотеці. Бажаєте замінити його новим вмістом?`,
                confirmLabel: "Замінити",
                type: "warning"
            });

            if (isConfirmed) {
                onSave(null, 'overwrite', duplicate.id);
                onClose();
            }
        } else {
            onSave(trimmedName, 'new');
            onClose();
        }
    };

    const handleOverwriteOriginal = async () => {
        const isConfirmed = await confirm({
            title: "Оновлення блоку",
            message: `Ви впевнені, що хочете оновити оригінальний блок "${originBlockInfo.name}" у бібліотеці? Це змінить його для всіх нових вставок.`,
            confirmLabel: "Оновити",
            type: "info"
        });

        if (isConfirmed) {
            onSave(null, 'overwrite', originBlockInfo.id);
            onClose();
        }
    };

    const primaryButton = {
        background: 'var(--platform-accent)', 
        color: 'var(--platform-accent-text)',
        padding: '10px 20px', 
        borderRadius: '8px', 
        border: 'none',
        fontWeight: '600', 
        cursor: 'pointer', 
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const primaryButtonHover = {
        background: 'var(--platform-accent-hover)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    };

    const secondaryButton = {
        background: 'transparent', 
        border: '1px solid var(--platform-border-color)', 
        color: 'var(--platform-text-primary)', 
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0.9rem',
        fontWeight: '500'
    };

    const secondaryButtonHover = {
        background: 'var(--platform-hover-bg)',
        borderColor: 'var(--platform-accent)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    };

    const dangerButton = {
        background: 'rgba(229, 62, 62, 0.1)', 
        border: '1px solid rgba(229, 62, 62, 0.2)', 
        color: '#e53e3e', 
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0.9rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const dangerButtonHover = {
        background: '#e53e3e',
        color: 'white',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 5px rgba(229, 62, 62, 0.3)'
    };

    const handleMouseOver = (element, hoverStyle) => {
        Object.assign(element.style, hoverStyle);
    };

    const handleMouseOut = (element, originalStyle) => {
        Object.assign(element.style, originalStyle);
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
    };

    const modalStyle = {
        background: 'var(--platform-card-bg)',
        width: '500px',
        maxWidth: '90vw',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        animation: 'slideUp 0.3s ease-out'
    };

    const headerStyle = {
        padding: '1.5rem 1.5rem 1rem',
        background: 'var(--platform-card-bg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative'
    };

    const bodyStyle = { 
        padding: '0 1.5rem 1.5rem'
    };

    const footerStyle = {
        padding: '1.5rem',
        background: 'var(--platform-card-bg)',
        borderTop: '1px solid var(--platform-border-color)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px'
    };

    const closeButtonStyle = {
        background: 'transparent',
        border: 'none',
        color: 'var(--platform-text-secondary)',
        cursor: 'pointer',
        fontSize: '1.5rem',
        lineHeight: 1,
        padding: '8px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px'
    };

    const closeButtonHover = {
        background: 'var(--platform-hover-bg)',
        color: 'var(--platform-text-primary)',
        transform: 'rotate(90deg)'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '0.95rem',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        marginBottom: '8px'
    };

    const inputHoverStyle = {
        borderColor: 'var(--platform-accent)',
        boxShadow: '0 0 0 2px rgba(var(--platform-accent-rgb), 0.1)'
    };

    const overwriteButtonStyle = {
        width: '100%',
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        border: 'none',
        padding: '14px 20px',
        borderRadius: '12px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 2px 8px rgba(var(--platform-accent-rgb), 0.3)'
    };

    const overwriteButtonHover = {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(var(--platform-accent-rgb), 0.4)'
    };

    const infoBoxStyle = {
        background: 'var(--platform-bg)',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--platform-border-color)',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div>
                        <h3 style={{
                            margin: '0 0 4px 0',
                            color: 'var(--platform-text-primary)',
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{
                                background: 'var(--platform-accent)',
                                color: 'white',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem'
                            }}>
                                💾
                            </span>
                            {originBlockInfo ? 'Оновлення блоку' : 'Зберегти блок'}
                        </h3>
                        <p style={{
                            margin: 0,
                            color: 'var(--platform-text-secondary)',
                            fontSize: '0.9rem'
                        }}>
                            {originBlockInfo 
                                ? 'Збережіть зміни або створіть новий варіант' 
                                : 'Додайте блок до бібліотеки для повторного використання'
                            }
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        style={closeButtonStyle}
                        onMouseOver={(e) => handleMouseOver(e.target, closeButtonHover)}
                        onMouseOut={(e) => handleMouseOut(e.target, closeButtonStyle)}
                    >
                        ✕
                    </button>
                </div>

                <div style={bodyStyle}>
                    {originBlockInfo ? (
                        <div style={{marginBottom: '1.5rem'}}>
                            <div style={infoBoxStyle}>
                                <p style={{
                                    color: 'var(--platform-text-secondary)',
                                    margin: '0 0 12px 0',
                                    fontSize: '0.85rem',
                                    fontWeight: '500'
                                }}>
                                    📦 Цей блок походить з бібліотеки:
                                </p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: 'var(--platform-accent)',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    padding: '10px',
                                    background: 'rgba(var(--platform-accent-rgb), 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(var(--platform-accent-rgb), 0.2)'
                                }}>
                                    <span>📦</span>
                                    <span>"{originBlockInfo.name}"</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleOverwriteOriginal}
                                style={overwriteButtonStyle}
                                onMouseOver={(e) => handleMouseOver(e.target, overwriteButtonHover)}
                                onMouseOut={(e) => handleMouseOut(e.target, overwriteButtonStyle)}
                            >
                                💾 Оновити оригінальний блок
                            </button>
                            
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                margin: '1.5rem 0'
                            }}>
                                <div style={{
                                    flex: 1, 
                                    height: '1px', 
                                    background: 'var(--platform-border-color)',
                                    opacity: 0.5
                                }}></div>
                                <span style={{
                                    color: 'var(--platform-text-secondary)',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    padding: '0 12px',
                                    whiteSpace: 'nowrap'
                                }}>АБО</span>
                                <div style={{
                                    flex: 1, 
                                    height: '1px', 
                                    background: 'var(--platform-border-color)',
                                    opacity: 0.5
                                }}></div>
                            </div>
                        </div>
                    ) : null}

                    <form onSubmit={handleSaveAsNew}>
                        <label style={{
                            display: 'block',
                            marginBottom: '10px',
                            color: 'var(--platform-text-primary)',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            {originBlockInfo ? 'Назва нового варіанту:' : 'Назва блоку:'}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Наприклад: Красивий заголовок"
                            disabled={isChecking}
                            style={inputStyle}
                            autoFocus={!originBlockInfo}
                            onMouseOver={(e) => handleMouseOver(e.target, inputHoverStyle)}
                            onMouseOut={(e) => handleMouseOut(e.target, inputStyle)}
                        />
                        {isChecking && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginTop: '12px',
                                color: 'var(--platform-text-secondary)',
                                fontSize: '0.85rem',
                                padding: '12px',
                                background: 'var(--platform-bg)',
                                borderRadius: '8px',
                                border: '1px solid var(--platform-border-color)'
                            }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid var(--platform-border-color)',
                                    borderTop: '2px solid var(--platform-accent)',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                Перевірка наявних блоків...
                            </div>
                        )}
                    </form>
                </div>

                <div style={footerStyle}>
                    <button 
                        onClick={onClose}
                        style={secondaryButton}
                        onMouseOver={(e) => handleMouseOver(e.target, secondaryButtonHover)}
                        onMouseOut={(e) => handleMouseOut(e.target, secondaryButton)}
                    >
                        Скасувати
                    </button>
                    <button 
                        onClick={handleSaveAsNew}
                        style={{
                            ...primaryButton,
                            opacity: (!name.trim() || isChecking) ? 0.6 : 1,
                            cursor: (!name.trim() || isChecking) ? 'not-allowed' : 'pointer'
                        }}
                        disabled={!name.trim() || isChecking}
                        onMouseOver={(e) => {
                            if (name.trim() && !isChecking) {
                                handleMouseOver(e.target, primaryButtonHover);
                            }
                        }}
                        onMouseOut={(e) => {
                            if (name.trim() && !isChecking) {
                                handleMouseOut(e.target, primaryButton);
                            }
                        }}
                    >
                        {originBlockInfo ? '💫 Зберегти як новий варіант' : '💾 Зберегти блок'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                input:focus {
                    outline: none;
                    border-color: var(--platform-accent) !important;
                    box-shadow: 0 0 0 3px rgba(var(--platform-accent-rgb), 0.15) !important;
                }
            `}</style>
        </div>
    );
};

export default SaveBlockModal;