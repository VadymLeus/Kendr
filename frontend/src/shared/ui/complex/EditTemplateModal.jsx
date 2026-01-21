// frontend/src/shared/ui/complex/EditTemplateModal.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../elements/Button';
import { InputWithCounter } from './InputWithCounter';
import { useConfirm } from '../../hooks/useConfirm';
import { X } from 'lucide-react';

const EditTemplateModal = ({ isOpen, onClose, initialData, onSave, isSaving }) => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const { confirm } = useConfirm();

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || ''
            });
        }
    }, [isOpen, initialData]);

    const handleSave = async () => {
        const isConfirmed = await confirm({
            title: "Зберегти зміни?",
            message: `Ви впевнені, що хочете оновити шаблон "${formData.name}"?`,
            type: "info",
            confirmLabel: "Зберегти"
        });

        if (isConfirmed) {
            onSave(formData.name, formData.description);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 bg-black/50 flex items-center justify-center backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-(--platform-card-bg) p-6 rounded-xl w-full max-w-100 border border-(--platform-border-color) shadow-2xl animate-[popIn_0.2s_ease]" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="m-0 text-lg font-semibold text-(--platform-text-primary)">Редагувати шаблон</h3>
                    <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-(--platform-text-secondary) hover:text-(--platform-text-primary)">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <InputWithCounter
                        label="Назва шаблону"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Мій крутий шаблон"
                        customLimit={50}
                    />

                    <div>
                        <label className="block mb-2 text-sm font-medium text-(--platform-text-secondary)">
                            Опис
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Короткий опис шаблону..."
                            className="w-full p-2.5 rounded-lg border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-primary) min-h-20 resize-y focus:outline-none focus:border-(--platform-accent)"
                        />
                    </div>

                    <div className="flex gap-2.5 mt-2">
                        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Скасувати</Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving || !formData.name.trim()} 
                            style={{ flex: 1 }}
                        >
                            {isSaving ? 'Збереження...' : 'Зберегти'}
                        </Button>
                    </div>
                </div>
            </div>
            <style>{`
                 @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default EditTemplateModal;