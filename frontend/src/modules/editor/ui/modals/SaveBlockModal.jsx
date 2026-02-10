// frontend/src/modules/editor/ui/modals/SaveBlockModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../../../shared/api/api';
import { useConfirm } from '../../../../shared/hooks/useConfirm';
import { Save, Package, Plus } from 'lucide-react';
import { Button } from '../../../../shared/ui/elements/Button';
import { Input } from '../../../../shared/ui/elements/Input';

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

    return (
        <div 
            ref={overlayRef} 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999 backdrop-blur-xs animate-in fade-in duration-200"
            onMouseDown={handleMouseDown} 
            onMouseUp={handleMouseUp}
        >
            <div 
                className="bg-(--platform-card-bg) text-(--platform-text-primary) border border-(--platform-border-color) rounded-2xl w-[90%] max-w-115 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 pb-2">
                    <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-(--platform-accent) flex items-center justify-center shrink-0">
                            <Save size={24} />
                        </div>
                        <div className="flex-1 flex flex-col gap-2 pt-0.5">
                            <h3 className="text-lg font-semibold m-0">
                                {originBlockInfo ? 'Оновлення блоку' : 'Зберегти блок'}
                            </h3>
                            <p className="m-0 text-[0.95rem] text-(--platform-text-secondary) leading-relaxed">
                                {originBlockInfo 
                                    ? 'Оновіть існуючий або створіть копію.' 
                                    : 'Додайте блок в бібліотеку для використання на інших сторінках.'
                                }
                            </p>
                        </div>
                    </div>

                    {originBlockInfo && (
                        <div className="mt-4 p-2.5 rounded-lg bg-(--platform-bg) border border-(--platform-border-color) flex items-center gap-2.5 text-sm">
                            <Package size={16} className="text-(--platform-text-secondary)" />
                            <span className="font-medium">Оригінал: </span>
                            <span className="text-(--platform-accent) font-semibold">{originBlockInfo.name}</span>
                        </div>
                    )}

                    <div className="mt-5">
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

                <div className="p-4 px-6 flex justify-end items-center gap-3 bg-(--platform-bg) border-t border-(--platform-border-color) mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Скасувати
                    </Button>
                    
                    {originBlockInfo && (
                        <Button 
                            variant="secondary" 
                            onClick={handleOverwriteOriginal}
                            title="Оновити вміст оригінального блоку у всіх місцях"
                        >
                            <Save size={16} /> Оновити оригінал
                        </Button>
                    )}

                    <Button 
                        variant="primary" 
                        onClick={handleSaveAsNew}
                        disabled={!name.trim() || isChecking}
                        style={{opacity: (!name.trim() || isChecking) ? 0.7 : 1}}
                    >
                        {originBlockInfo ? <><Plus size={16} /> Зберегти як новий</> : 'Зберегти'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SaveBlockModal;