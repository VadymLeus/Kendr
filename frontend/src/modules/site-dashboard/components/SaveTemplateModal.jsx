// frontend/src/modules/site-dashboard/components/SaveTemplateModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../common/services/api';
import { useConfirm } from '../../../common/hooks/useConfirm';

const SaveTemplateModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [existingTemplates, setExistingTemplates] = useState([]);
    const [checking, setChecking] = useState(false);
    const { confirm } = useConfirm();

    useEffect(() => {
        if (isOpen) {
            setChecking(true);
            apiClient.get('/templates/personal')
                .then(res => setExistingTemplates(res.data))
                .catch(err => console.error("Помилка перевірки шаблонів", err))
                .finally(() => setChecking(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const duplicate = existingTemplates.find(t => t.name.toLowerCase() === name.trim().toLowerCase());

        if (duplicate) {
            const isConfirmed = await confirm({
                title: "Шаблон вже існує",
                message: `Шаблон з назвою "${name}" вже існує. Оновити його вміст поточним станом сайту?`,
                confirmLabel: "Оновити",
                type: "warning"
            });
            
            if (isConfirmed) {
                onSave(name, description, duplicate.id);
                handleClose();
            }
        } else {
            onSave(name, description, null);
            handleClose();
        }
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        onClose();
    };

    const styles = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
            backdropFilter: 'blur(4px)'
        },
        content: {
            background: 'var(--platform-card-bg)', padding: '2rem', borderRadius: '16px',
            width: '450px', maxWidth: '90%', border: '1px solid var(--platform-border-color)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
        },
        input: {
            width: '100%', padding: '0.8rem', marginBottom: '1rem',
            border: '1px solid var(--platform-border-color)', borderRadius: '8px',
            background: 'var(--platform-bg)', color: 'var(--platform-text-primary)',
            boxSizing: 'border-box', fontSize: '1rem'
        },
        label: {
            display: 'block', marginBottom: '0.5rem', color: 'var(--platform-text-primary)', fontWeight: '600', fontSize: '0.9rem'
        },
        btnGroup: {
            display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem'
        },
        btnPrimary: {
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: 'var(--platform-accent)', color: 'var(--platform-accent-text)',
            cursor: 'pointer', fontWeight: '600'
        },
        btnSecondary: {
            padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--platform-border-color)',
            background: 'transparent', color: 'var(--platform-text-primary)',
            cursor: 'pointer', fontWeight: '600'
        }
    };

    return (
        <div style={styles.overlay} onClick={handleClose}>
            <div style={styles.content} onClick={e => e.stopPropagation()}>
                <h3 style={{color: 'var(--platform-text-primary)', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem'}}>💾 Зберегти як шаблон</h3>
                
                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={styles.label}>Назва шаблону</label>
                        <input 
                            style={styles.input} 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="Наприклад: Літній розпродаж"
                            required
                            autoFocus
                            disabled={checking}
                        />
                    </div>
                    
                    <div>
                        <label style={styles.label}>Опис (необов'язково)</label>
                        <input 
                            style={styles.input} 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Короткий опис призначення..."
                            disabled={checking}
                        />
                    </div>

                    <div style={styles.btnGroup}>
                        <button type="button" onClick={handleClose} style={styles.btnSecondary}>Скасувати</button>
                        <button type="submit" style={{...styles.btnPrimary, opacity: (!name.trim() || checking) ? 0.7 : 1}} disabled={!name.trim() || checking}>
                            {checking ? 'Перевірка...' : 'Зберегти'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveTemplateModal;