// frontend/src/features/sites/components/SaveTemplateModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

const SaveTemplateModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [existingTemplates, setExistingTemplates] = useState([]);
    const [checking, setChecking] = useState(false);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const duplicate = existingTemplates.find(t => t.name.toLowerCase() === name.trim().toLowerCase());

        if (duplicate) {
            const confirmOverwrite = window.confirm(
                `Шаблон з назвою "${name}" вже існує.\n\nБажаєте оновити його вміст поточним станом сайту?`
            );
            
            if (confirmOverwrite) {
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
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        },
        content: {
            background: 'var(--platform-card-bg)', padding: '2rem', borderRadius: '12px',
            width: '400px', border: '1px solid var(--platform-border-color)'
        },
        input: {
            width: '100%', padding: '0.75rem', marginBottom: '1rem',
            border: '1px solid var(--platform-border-color)', borderRadius: '6px',
            background: 'var(--platform-bg)', color: 'var(--platform-text-primary)',
            boxSizing: 'border-box'
        }
    };

    return (
        <div style={styles.overlay} onClick={handleClose}>
            <div style={styles.content} onClick={e => e.stopPropagation()}>
                <h3 style={{color: 'var(--platform-text-primary)', marginTop: 0}}>💾 Зберегти як шаблон</h3>
                
                <form onSubmit={handleSubmit}>
                    <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--platform-text-secondary)'}}>Назва шаблону</label>
                    <input 
                        style={styles.input} 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Мій крутий шаблон"
                        required
                        autoFocus
                        disabled={checking}
                    />
                    
                    <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--platform-text-secondary)'}}>Опис (необов'язково)</label>
                    <input 
                        style={styles.input} 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Для лендінгів..."
                        disabled={checking}
                    />

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem'}}>
                        <button type="button" onClick={handleClose} className="btn btn-secondary">Скасувати</button>
                        <button type="submit" className="btn btn-primary" disabled={!name.trim() || checking}>
                            {checking ? '...' : 'Зберегти'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveTemplateModal;