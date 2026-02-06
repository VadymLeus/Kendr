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
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                textAlign: 'left',
                lineHeight: 1.5,
                color: 'var(--platform-text-primary)'
            }} 
            onClick={onClose}
        >
            <div 
                style={{
                    backgroundColor: 'var(--platform-card-bg, #fff)', 
                    padding: '24px', 
                    borderRadius: '12px', 
                    width: '100%', 
                    maxWidth: '450px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    border: '1px solid var(--platform-border-color)',
                    position: 'relative',
                    margin: '16px'
                }} 
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ 
                        margin: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        fontSize: '1.25rem', 
                        fontWeight: 600,
                        color: 'var(--platform-text-primary)' 
                    }}>
                        <div style={{ 
                            background: 'rgba(229, 62, 62, 0.1)', 
                            borderRadius: '8px', 
                            padding: '6px',
                            display: 'flex' 
                        }}>
                            <AlertTriangle color="#e53e3e" size={24} />
                        </div>
                        Поскаржитись на сайт
                    </h3>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            cursor: 'pointer', 
                            color: 'var(--platform-text-secondary)',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--platform-hover-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 500, 
                            fontSize: '0.9rem',
                            color: 'var(--platform-text-primary)'
                        }}>
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

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 500, 
                            fontSize: '0.9rem',
                            color: 'var(--platform-text-primary)'
                        }}>
                            Деталі (необов'язково):
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Опишіть проблему детальніше..."
                            rows={4}
                            className="custom-scrollbar"
                            style={{
                                width: '100%', 
                                padding: '10px 12px', 
                                borderRadius: '8px',
                                border: '1px solid var(--platform-border-color, #ccc)',
                                backgroundColor: 'var(--platform-input-bg, #fff)',
                                color: 'var(--platform-text-primary)', 
                                resize: 'vertical', 
                                fontFamily: 'inherit',
                                fontSize: '0.9rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--platform-accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--platform-border-color)'}
                        />
                    </div>

                    {errorMessage && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: '#fff5f5',
                            border: '1px solid #fc8181',
                            color: '#c53030',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <AlertCircle size={18} flexShrink={0} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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