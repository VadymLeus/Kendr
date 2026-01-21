// frontend/src/shared/ui/complex/EmptyState.jsx
import React from 'react';
import { Search } from 'lucide-react';

const EmptyState = ({ 
    icon: Icon = Search,
    title = "Нічого не знайдено", 
    description, 
    action 
}) => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            minHeight: '300px',
            color: 'var(--platform-text-secondary)',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{ 
                padding: '40px', 
                border: '2px dashed var(--platform-border-color)', 
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'var(--platform-bg)'
            }}>
                <Icon size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                
                <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '1.1rem', 
                    fontWeight: 600,
                    color: 'var(--platform-text-primary)'
                }}>
                    {title}
                </h3>
                
                {description && (
                    <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', opacity: 0.8 }}>
                        {description}
                    </p>
                )}
                
                {action && (
                    <div style={{ marginTop: '8px' }}>
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmptyState;