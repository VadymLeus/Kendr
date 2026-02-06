// frontend/src/modules/admin/components/AdminPageLayout.jsx
import React, { useMemo } from 'react';
import { Button } from '../../../shared/ui/elements/Button';
import { RefreshCw } from 'lucide-react';

const AdminPageLayout = ({ 
    title, 
    icon: Icon, 
    count, 
    onRefresh, 
    loading,
    children 
}) => {
    const styles = useMemo(() => ({
        container: {
            maxWidth: '100%', 
            height: 'calc(100vh - 64px)',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            padding: '20px 32px',
            overflow: 'hidden'
        },
        header: { 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '16px',
            flexShrink: 0
        },
        titleGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
        title: { fontSize: '24px', fontWeight: 'bold', color: 'var(--platform-text-primary)', display: 'flex', alignItems: 'center', gap: '12px' },
        controls: { display: 'flex', gap: '12px', alignItems: 'center' },
        countBadge: {
            fontSize: '14px', color: 'var(--platform-text-secondary)', fontWeight: 'normal', 
            marginLeft: '8px', background: 'var(--platform-bg)', padding: '2px 8px', 
            borderRadius: '8px', border: '1px solid var(--platform-border-color)'
        },
        content: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
        }
    }), []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <h1 style={styles.title}>
                        {Icon && <Icon size={24} color="var(--platform-accent)" />}
                        {title}
                        {(count !== undefined && count !== null) && (
                            <span style={styles.countBadge}>{count}</span>
                        )}
                    </h1>
                </div>

                <div style={styles.controls}>
                    <Button variant="outline" onClick={onRefresh} disabled={loading} style={{width: '40px', height: '40px', padding: 0, justifyContent: 'center'}}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>
            
            <div style={styles.content}>
                {children}
            </div>
        </div>
    );
};

export default AdminPageLayout;