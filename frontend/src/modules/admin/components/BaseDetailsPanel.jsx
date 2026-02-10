// frontend/src/modules/admin/components/BaseDetailsPanel.jsx
import React, { useMemo } from 'react';
import { Button } from '../../../shared/ui/elements/Button';
import { X, Trash } from 'lucide-react';

const BaseDetailsPanel = ({ title, onClose, onDelete, deleteLabel = "Видалити", deleteDisabled = false, deleteTitle, children }) => {
    const styles = useMemo(() => ({
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)', zIndex: 49, backdropFilter: 'blur(2px)'
        },
        panel: {
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px',
            background: 'var(--platform-card-bg)', borderLeft: '1px solid var(--platform-border-color)',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)', zIndex: 50,
            display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s ease'
        },
        header: {
            padding: '20px 24px', borderBottom: '1px solid var(--platform-border-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--platform-bg)'
        },
        title: { fontSize: '18px', fontWeight: 'bold', color: 'var(--platform-text-primary)' },
        content: { padding: '24px', flex: 1, overflowY: 'auto' },
        footer: {
            padding: '24px', borderTop: '1px solid var(--platform-border-color)',
            background: 'var(--platform-bg)', display: 'flex', flexDirection: 'column', gap: '12px'
        }
    }), []);
    return (
        <>
            <div style={styles.overlay} onClick={onClose} />
            <div style={styles.panel}>
                <div style={styles.header}>
                    <h2 style={styles.title}>{title}</h2>
                    <Button variant="ghost" onClick={onClose} icon={<X size={20} />} style={{width: '32px', height: '32px', padding: 0, justifyContent: 'center'}} />
                </div>
                <div style={styles.content} className="custom-scrollbar">
                    {children}
                </div>
                {onDelete && (
                    <div style={styles.footer}>
                        <Button 
                            variant="danger" 
                            onClick={onDelete}
                            icon={<Trash size={18} />}
                            disabled={deleteDisabled}
                            title={deleteTitle}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {deleteLabel}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

export default BaseDetailsPanel;