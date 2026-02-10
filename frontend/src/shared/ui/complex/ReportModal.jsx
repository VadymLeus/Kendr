// frontend/src/shared/ui/complex/ReportModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../elements/Button';
import apiClient from '../../api/api';
import { toast } from 'react-toastify';
import CustomSelect from '../elements/CustomSelect';
import { X, AlertTriangle, ShieldAlert, Ban, FileWarning, Copyright, HelpCircle, AlertCircle } from 'lucide-react';

const ReportModal = ({ isOpen, onClose, siteId }) => {
    const [reason, setReason] = useState('spam');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    useEffect(() => {
        if (isOpen) {
            setErrorMessage(null);
            setReason('spam');
            setDescription('');
        }
    }, [isOpen]);

    if (!isOpen) return null;
    const reportOptions = [
        { value: 'spam', label: 'Спам або реклама', icon: Ban },
        { value: 'scam', label: 'Шахрайство', icon: ShieldAlert },
        { value: 'inappropriate_content', label: 'Заборонений контент', icon: FileWarning },
        { value: 'copyright', label: 'Порушення авторських прав', icon: Copyright },
        { value: 'other', label: 'Інше', icon: HelpCircle }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            await apiClient.post('/reports', {
                site_id: siteId,
                reason,
                description
            }, {
                suppressToast: true
            });

            toast.success('Скаргу відправлено. Дякуємо за пильність!');
            onClose();
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Не вдалося відправити скаргу. Спробуйте пізніше.');
            }
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-[2px] text-left leading-normal text-(--platform-text-primary) font-sans"
            onClick={onClose}
        >
            <div 
                className="bg-(--platform-card-bg) p-6 rounded-xl w-full max-w-112.5 shadow-2xl border border-(--platform-border-color) relative m-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-5">
                    <h3 className="m-0 flex items-center gap-2.5 text-xl font-semibold text-(--platform-text-primary)">
                        <div className="bg-red-500/10 rounded-lg p-1.5 flex">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        Поскаржитись на сайт
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="bg-transparent border-none cursor-pointer text-(--platform-text-secondary) p-1 flex items-center justify-center rounded hover:bg-(--platform-hover-bg) transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 font-medium text-sm text-(--platform-text-primary)">
                            Причина:
                        </label>
                        <CustomSelect 
                            name="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            options={reportOptions}
                            placeholder="Оберіть причину..."
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-medium text-sm text-(--platform-text-primary)">
                            Деталі (необов'язково):
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Опишіть проблему детальніше..."
                            rows={4}
                            className="custom-scrollbar w-full p-2.5 rounded-lg border border-(--platform-border-color) bg-(--platform-input-bg) text-(--platform-text-primary) resize-y font-inherit text-sm outline-none box-border focus:border-(--platform-accent) focus:ring-1 focus:ring-(--platform-accent)"
                        />
                    </div>

                    {errorMessage && (
                        <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            Скасувати
                        </Button>
                        <Button type="submit" variant="danger" isLoading={loading}>
                            Відправити скаргу
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default ReportModal;