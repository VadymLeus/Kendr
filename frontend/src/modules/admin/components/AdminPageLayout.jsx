// frontend/src/modules/admin/components/AdminPageLayout.jsx
import React, { useMemo } from 'react';
import { Input } from '../../../shared/ui/elements/Input';
import { Button } from '../../../shared/ui/elements/Button';
import { Search, List, Grid, RefreshCw } from 'lucide-react';

const AdminPageLayout = ({ 
    title, 
    icon: Icon, 
    count, 
    searchQuery, 
    setSearchQuery,
    viewMode, 
    setViewMode, 
    onRefresh, 
    loading,
    searchPlaceholder = "Пошук...",
    children 
}) => {
    const styles = useMemo(() => ({
        container: {
            maxWidth: '1600px', margin: '0 auto', padding: '32px',
            height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', gap: '24px',
            width: '100%'
        },
        header: { 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
            width: '100%'
        },
        titleGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
        title: { fontSize: '28px', fontWeight: 'bold', color: 'var(--platform-text-primary)', display: 'flex', alignItems: 'center', gap: '12px' },
        controls: { display: 'flex', gap: '12px', alignItems: 'center' },
        countBadge: {
            fontSize: '16px', color: 'var(--platform-text-secondary)', fontWeight: 'normal', 
            marginLeft: '8px', background: 'var(--platform-bg)', padding: '2px 8px', 
            borderRadius: '8px', border: '1px solid var(--platform-border-color)'
        },
        viewToggle: {
            display: 'flex', background: 'var(--platform-card-bg)', 
            border: '1px solid var(--platform-border-color)', borderRadius: '8px', padding: '2px'
        },
        toggleBtn: (active) => ({
            padding: '6px', borderRadius: '6px', 
            background: active ? 'var(--platform-bg)' : 'transparent', 
            color: active ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)', 
            border: active ? '1px solid var(--platform-border-color)' : 'none', 
            cursor: 'pointer', display: 'flex'
        })
    }), []);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleGroup}>
                    <h1 style={styles.title}>
                        {Icon && <Icon size={28} color="var(--platform-accent)" />}
                        {title}
                        {(count !== undefined && count !== null) && (
                            <span style={styles.countBadge}>{count}</span>
                        )}
                    </h1>
                </div>

                <div style={styles.controls}>
                    {setSearchQuery && (
                        <div style={{width: '280px'}}>
                            <Input 
                                placeholder={searchPlaceholder}
                                leftIcon={<Search size={16}/>}
                                value={searchQuery || ''} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                wrapperStyle={{margin: 0}}
                            />
                        </div>
                    )}
                    
                    {setViewMode && (
                        <div style={styles.viewToggle}>
                            <button onClick={() => setViewMode('list')} style={styles.toggleBtn(viewMode === 'list')}><List size={18} /></button>
                            <button onClick={() => setViewMode('grid')} style={styles.toggleBtn(viewMode === 'grid')}><Grid size={18} /></button>
                        </div>
                    )}

                    <Button variant="outline" onClick={onRefresh} disabled={loading} style={{width: '40px', height: '40px', padding: 0, justifyContent: 'center'}}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>
            {children}
        </div>
    );
};

export default AdminPageLayout;