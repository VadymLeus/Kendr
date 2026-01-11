// frontend/src/modules/dashboard/components/SaveTemplateModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../shared/api/api';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { Input, Button } from '../../../shared/ui/elements';
import { Save, Layout, FileText, Loader2, Check } from 'lucide-react';

const SaveTemplateModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [existingTemplates, setExistingTemplates] = useState([]);
    const [checking, setChecking] = useState(false);
    const { confirm } = useConfirm();
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setChecking(true);
            setName('');
            setDescription('');
            apiClient.get('/user-templates')
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
                confirmLabel: "Оновити шаблон",
                type: "warning"
            });
            
            if (isConfirmed) {
                onSave(name, description, duplicate.id);
                onClose();
            }
        } else {
            onSave(name, description, null);
            onClose();
        }
    };

    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2100, backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
    };

    const modalStyle = {
        backgroundColor: 'var(--platform-card-bg)',
        color: 'var(--platform-text-primary)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '16px',
        width: '90%', maxWidth: '460px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out',
        boxSizing: 'border-box'
    };

    const contentStyle = { padding: '24px 24px 8px 24px' };
    
    const headerStyle = { display: 'flex', gap: '16px', alignItems: 'flex-start' };
    
    const iconBoxStyle = {
        width: '48px', height: '48px', borderRadius: '12px',
        backgroundColor: 'rgba(66, 153, 225, 0.1)', 
        color: 'var(--platform-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    };

    const footerStyle = {
        padding: '16px 24px',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px',
        backgroundColor: 'var(--platform-bg)',
        borderTop: '1px solid var(--platform-border-color)',
        marginTop: '16px'
    };

    return (
        <div 
            ref={overlayRef}
            style={overlayStyle} 
            onMouseDown={(e) => {
                overlayRef.current.isSelfClick = (e.target === overlayRef.current);
            }}
            onMouseUp={(e) => {
                if (e.target === overlayRef.current && overlayRef.current.isSelfClick) {
                    onClose();
                }
            }}
        >
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `}</style>
            
            <div style={modalStyle}>
                <div style={contentStyle}>
                    <div style={headerStyle}>
                        <div style={iconBoxStyle}>
                            <Save size={24} />
                        </div>
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '2px'}}>
                            <h3 style={{fontSize: '1.15rem', fontWeight: '600', margin: 0}}>
                                Зберегти як шаблон
                            </h3>
                            <p style={{margin: 0, fontSize: '0.95rem', color: 'var(--platform-text-secondary)', lineHeight: '1.5'}}>
                                Збережіть поточний дизайн сайту як шаблон для майбутнього використання.
                            </p>
                        </div>
                    </div>

                    <div style={{marginTop: '24px'}}>
                        <form id="save-template-form" onSubmit={handleSubmit}>
                            <div style={{marginBottom: '16px'}}>
                                <Input 
                                    label="Назва шаблону"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Наприклад: Літній розпродаж"
                                    required
                                    autoFocus
                                    disabled={checking}
                                    icon={<Layout size={18} />}
                                />
                            </div>
                            
                            <div>
                                <Input 
                                    label="Опис (необов'язково)"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Короткий опис призначення..."
                                    disabled={checking}
                                    icon={<FileText size={18} />}
                                />
                            </div>

                            {name && existingTemplates.some(t => t.name.toLowerCase() === name.trim().toLowerCase()) && (
                                <div style={{ 
                                    marginTop: '16px',
                                    fontSize: '0.85rem', 
                                    color: 'var(--platform-warning)', 
                                    background: 'rgba(236, 201, 75, 0.1)', 
                                    padding: '10px 12px', 
                                    borderRadius: '8px',
                                    border: '1px solid var(--platform-warning)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    Шаблон з такою назвою вже існує.
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                <div style={footerStyle}>
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                    >
                        Скасувати
                    </Button>
                    <Button 
                        type="submit" 
                        form="save-template-form"
                        disabled={!name.trim() || checking}
                        icon={checking ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                    >
                        {checking ? 'Завантаження...' : 'Зберегти'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SaveTemplateModal;