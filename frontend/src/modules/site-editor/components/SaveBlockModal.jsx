// frontend/src/modules/site-editor/components/SaveBlockModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../../common/services/api';
import { useConfirm } from '../../../common/hooks/useConfirm';
import { toast } from 'react-toastify';
import { IconSave, IconPackage, IconPlus } from '../../../common/components/ui/Icons';
import { Button } from '../../../common/components/ui/Button';
import { Input } from '../../../common/components/ui/Input';

const SaveBlockModal = ({ isOpen, onClose, onSave, originBlockInfo }) => {
    const [name, setName] = useState('');
    const [existingBlocks, setExistingBlocks] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const { confirm } = useConfirm();

    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setIsChecking(true);
            apiClient.get('/saved-blocks')
                .then(res => setExistingBlocks(res.data))
                .catch(err => console.error("Failed to check blocks", err))
                .finally(() => setIsChecking(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleMouseDown = (e) => {
        if (e.target === overlayRef.current) {
            overlayRef.current.isSelfClick = true;
        } else {
            overlayRef.current.isSelfClick = false;
        }
    };

    const handleMouseUp = (e) => {
        if (e.target === overlayRef.current && overlayRef.current.isSelfClick) {
            onClose();
        }
    };

    const handleSaveAsNew = async (e) => {
        if (e) e.preventDefault();
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
            message: `Ви впевнені, що хочете оновити оригінальний блок "${originBlockInfo.name}"? Це змінить його для всіх нових вставок.`,
            confirmLabel: "Оновити",
            type: "info"
        });

        if (isConfirmed) {
            onSave(null, 'overwrite', originBlockInfo.id);
            onClose();
        }
    };

    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, backdropFilter: 'blur(4px)',
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
        animation: 'slideUp 0.3s ease-out'
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
            onMouseDown={handleMouseDown} 
            onMouseUp={handleMouseUp}
        >
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={contentStyle}>
                    <div style={headerStyle}>
                        <div style={iconBoxStyle}>
                            <IconSave size={24} />
                        </div>
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '2px'}}>
                            <h3 style={{fontSize: '1.15rem', fontWeight: '600', margin: 0}}>
                                {originBlockInfo ? 'Оновлення блоку' : 'Зберегти блок'}
                            </h3>
                            <p style={{margin: 0, fontSize: '0.95rem', color: 'var(--platform-text-secondary)', lineHeight: '1.5'}}>
                                {originBlockInfo 
                                    ? 'Оновіть існуючий або створіть копію.' 
                                    : 'Додайте блок в бібліотеку для використання на інших сторінках.'
                                }
                            </p>
                        </div>
                    </div>

                    {originBlockInfo && (
                        <div style={{
                            marginTop: '16px',
                            padding: '10px',
                            borderRadius: '8px',
                            background: 'var(--platform-bg)',
                            border: '1px solid var(--platform-border-color)',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            fontSize: '0.85rem'
                        }}>
                            <IconPackage size={16} style={{color: 'var(--platform-text-secondary)'}} />
                            <span style={{fontWeight: '500'}}>Оригінал: </span>
                            <span style={{color: 'var(--platform-accent)', fontWeight: '600'}}>{originBlockInfo.name}</span>
                        </div>
                    )}

                    <div style={{marginTop: '20px'}}>
                        <Input 
                            label={originBlockInfo ? "Назва нового варіанту (опціонально)" : "Назва блоку"}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Наприклад: Мій улюблений банер"
                            disabled={isChecking}
                            autoFocus={!originBlockInfo}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && name.trim()) handleSaveAsNew(e);
                            }}
                        />
                    </div>
                </div>

                <div style={footerStyle}>
                    <Button variant="outline" onClick={onClose}>
                        Скасувати
                    </Button>
                    
                    {originBlockInfo && (
                        <Button 
                            variant="secondary" 
                            onClick={handleOverwriteOriginal}
                            title="Оновити вміст оригінального блоку у всіх місцях"
                        >
                            <IconSave size={16} /> Оновити оригінал
                        </Button>
                    )}

                    <Button 
                        variant="primary" 
                        onClick={handleSaveAsNew}
                        disabled={!name.trim() || isChecking}
                        style={{opacity: (!name.trim() || isChecking) ? 0.7 : 1}}
                    >
                        {originBlockInfo ? <><IconPlus size={16} /> Зберегти як новий</> : 'Зберегти'}
                    </Button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `}</style>
        </div>
    );
};

export default SaveBlockModal;