// frontend/src/features/editor/SaveBlockModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';

const SaveBlockModal = ({ isOpen, onClose, onSave, originBlockInfo }) => {
    const [name, setName] = useState('');
    const [existingBlocks, setExistingBlocks] = useState([]);
    const [isChecking, setIsChecking] = useState(false);

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

    const handleSaveAsNew = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        
        if (!trimmedName) {
            toast.warning('Будь ласка, введіть назву для блоку');
            return;
        }

        const duplicate = existingBlocks.find(b => b.name.toLowerCase() === trimmedName.toLowerCase());

        if (duplicate) {
            const confirmReplace = window.confirm(
                `Блок з назвою "${trimmedName}" вже існує у вашій бібліотеці.\n\nБажаєте замінити його новим вмістом?`
            );

            if (confirmReplace) {
                onSave(null, 'overwrite', duplicate.id);
                toast.success(`✅ Блок "${trimmedName}" успішно оновлено!`);
                onClose();
            }
        } else {
            onSave(trimmedName, 'new');
            toast.success(`✅ Блок "${trimmedName}" успішно збережено!`);
            onClose();
        }
    };

    const handleOverwriteOriginal = () => {
        if (window.confirm(`Ви впевнені, що хочете оновити оригінальний блок "${originBlockInfo.name}"?`)) {
            onSave(null, 'overwrite', originBlockInfo.id);
            toast.success(`✅ Оригінальний блок "${originBlockInfo.name}" успішно оновлено!`);
            onClose();
        }
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
        padding: '1rem'
    };

    const modalStyle = {
        background: 'var(--platform-card-bg)',
        width: '500px',
        maxWidth: '90vw',
        borderRadius: '8px',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const headerStyle = {
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--platform-border-color)',
        background: 'var(--platform-sidebar-bg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const bodyStyle = { 
        padding: '1.5rem'
    };

    const footerStyle = {
        padding: '1rem 1.5rem',
        background: 'var(--platform-bg)',
        borderTop: '1px solid var(--platform-border-color)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
    };

    const closeButtonStyle = {
        background: 'none',
        border: 'none',
        color: 'var(--platform-text-secondary)',
        cursor: 'pointer',
        fontSize: '1.2rem',
        lineHeight: 1,
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'all 0.2s ease'
    };

    const primaryButtonStyle = {
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    const secondaryButtonStyle = {
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-secondary)',
        border: '1px solid var(--platform-border-color)',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    const inputStyle = {
        width: '100%',
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)',
        fontSize: '14px',
        boxSizing: 'border-box'
    };

    const overwriteButtonStyle = {
        width: '100%',
        background: 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: '1rem'
    };

    const infoBoxStyle = {
        background: 'var(--platform-bg)',
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid var(--platform-border-color)',
        marginBottom: '1rem',
        fontSize: '14px'
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <h3 style={{
                        margin: 0,
                        color: 'var(--platform-text-primary)',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                    }}>
                        {originBlockInfo ? '🔄 Оновлення блоку' : '💾 Зберегти блок'}
                    </h3>
                    <button 
                        onClick={onClose}
                        style={closeButtonStyle}
                        onMouseEnter={e => {
                            e.target.style.background = 'var(--platform-bg)';
                            e.target.style.color = 'var(--platform-text-primary)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.background = 'none';
                            e.target.style.color = 'var(--platform-text-secondary)';
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={bodyStyle}>
                    {originBlockInfo ? (
                        <div style={{marginBottom: '1.5rem'}}>
                            <div style={infoBoxStyle}>
                                <p style={{
                                    color: 'var(--platform-text-primary)',
                                    margin: '0 0 8px 0',
                                    fontSize: '14px'
                                }}>
                                    Цей блок походить з бібліотеки:
                                </p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: 'var(--platform-accent)',
                                    fontWeight: '500'
                                }}>
                                    <span>📦</span>
                                    <span>"{originBlockInfo.name}"</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleOverwriteOriginal}
                                style={overwriteButtonStyle}
                                onMouseEnter={e => {
                                    e.target.style.opacity = '0.9';
                                }}
                                onMouseLeave={e => {
                                    e.target.style.opacity = '1';
                                }}
                            >
                                💾 Оновити оригінальний блок
                            </button>
                            
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                margin: '1rem 0'
                            }}>
                                <div style={{flex: 1, height: '1px', background: 'var(--platform-border-color)'}}></div>
                                <span style={{
                                    color: 'var(--platform-text-secondary)',
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                }}>або зберегти як новий</span>
                                <div style={{flex: 1, height: '1px', background: 'var(--platform-border-color)'}}></div>
                            </div>
                        </div>
                    ) : null}

                    <form onSubmit={handleSaveAsNew}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: 'var(--platform-text-primary)',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            Назва нового блоку:
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Наприклад: Це мій блок!"
                            disabled={isChecking}
                            style={inputStyle}
                            autoFocus={!originBlockInfo}
                        />
                        {isChecking && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginTop: '8px',
                                color: 'var(--platform-text-secondary)',
                                fontSize: '13px'
                            }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    border: '2px solid var(--platform-border-color)',
                                    borderTop: '2px solid var(--platform-accent)',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                ⏳ Перевірка наявних блоків...
                            </div>
                        )}
                    </form>
                </div>

                <div style={footerStyle}>
                    <button 
                        onClick={onClose}
                        style={secondaryButtonStyle}
                        onMouseEnter={e => {
                            e.target.style.background = 'var(--platform-card-bg)';
                            e.target.style.color = 'var(--platform-text-primary)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.background = 'var(--platform-bg)';
                            e.target.style.color = 'var(--platform-text-secondary)';
                        }}
                    >
                        ❌ Скасувати
                    </button>
                    <button 
                        onClick={handleSaveAsNew}
                        style={{
                            ...primaryButtonStyle,
                            opacity: (!name.trim() || isChecking) ? 0.6 : 1,
                            cursor: (!name.trim() || isChecking) ? 'not-allowed' : 'pointer'
                        }}
                        disabled={!name.trim() || isChecking}
                        onMouseEnter={e => {
                            if (name.trim() && !isChecking) {
                                e.target.style.opacity = '0.9';
                            }
                        }}
                        onMouseLeave={e => {
                            if (name.trim() && !isChecking) {
                                e.target.style.opacity = '1';
                            }
                        }}
                    >
                        {originBlockInfo ? '💫 Зберегти як новий блок' : '💾 Зберегти блок'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SaveBlockModal;