// frontend/src/modules/admin/components/AdminTableComponents.jsx
import React from 'react';
import { ArrowUp, ArrowDown, Inbox } from 'lucide-react';

const styles = {
    card: { 
        background: 'var(--platform-card-bg)', 
        borderRadius: '16px', 
        border: '1px solid var(--platform-border-color)', 
        overflow: 'hidden', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
        width: '100%',
        height: '100%'
    },
    wrapper: { 
        flex: 1, 
        overflowY: 'auto', 
        width: '100%',
        display: 'flex',       
        flexDirection: 'column',
        height: '100%'
    },
    table: { 
        width: '100%', 
        borderCollapse: 'collapse', 
        fontSize: '15px', 
        tableLayout: 'fixed',
        height: 'auto'
    },
    th: { 
        textAlign: 'left', 
        padding: '16px 20px', 
        background: 'var(--platform-bg)', 
        color: 'var(--platform-text-secondary)', 
        fontWeight: '600', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10, 
        borderBottom: '1px solid var(--platform-border-color)', 
        whiteSpace: 'nowrap', 
        cursor: 'pointer', 
        userSelect: 'none', 
        transition: 'background 0.2s',
        height: '50px'
    },
    thContent: { display: 'flex', alignItems: 'center', gap: '6px' },
    td: { 
        padding: '16px 20px', 
        borderBottom: '1px solid var(--platform-border-color)', 
        color: 'var(--platform-text-primary)', 
        verticalAlign: 'middle', 
        whiteSpace: 'nowrap', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis' 
    },
    row: { transition: 'background 0.1s' },
    emptyState: { 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%',
        minHeight: '60vh',
        color: 'var(--platform-text-secondary)', 
        gap: '16px', 
        padding: '40px' 
    },
    filterGroup: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }
};

export const FilterBar = ({ children, style = {} }) => (
    <div style={{...styles.filterGroup, ...style}}>
        {children}
    </div>
);

export const SortIcon = ({ active, direction }) => {
    if (!active) return <div style={{width: 14, height: 14, opacity: 0}} />; 
    return direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
};

export const AdminTable = ({ children }) => (
    <div style={styles.card}>
        <div style={styles.wrapper} className="custom-scrollbar">
            <table style={styles.table}>
                {children}
            </table>
        </div>
    </div>
);

export const AdminTh = ({ label, sortKey, currentSort, onSort, width, align = 'left', style = {} }) => (
    <th 
        style={{...styles.th, width, textAlign: align, cursor: sortKey ? 'pointer' : 'default', ...style}} 
        onClick={() => sortKey && onSort && onSort(sortKey)}
    >
        <div style={{...styles.thContent, justifyContent: align === 'right' ? 'flex-end' : 'flex-start'}}>
            {label}
            {sortKey && currentSort && (
                <SortIcon active={currentSort.key === sortKey} direction={currentSort.direction} />
            )}
        </div>
    </th>
);

export const AdminRow = ({ children, onClick, isSelected, style = {} }) => (
    <tr 
        onClick={onClick} 
        className="hover:bg-(--platform-bg)"
        style={{
            ...styles.row, 
            background: isSelected ? 'var(--platform-bg)' : 'transparent', 
            cursor: onClick ? 'pointer' : 'default',
            ...style
        }}
    >
        {children}
    </tr>
);

export const AdminCell = ({ children, style = {}, align = 'left', colSpan }) => (
    <td colSpan={colSpan} style={{...styles.td, textAlign: align, ...style}}>
        {children}
    </td>
);

export const LoadingRow = ({ cols = 5 }) => (
    <>
        {[...Array(5)].map((_, i) => (
            <tr key={i}>
                <td colSpan={cols} style={{padding:'24px', textAlign:'center', opacity:0.5}}>Завантаження...</td>
            </tr>
        ))}
    </>
);

export const EmptyRow = ({ cols = 5, message = "Даних не знайдено", icon: Icon = Inbox }) => (
    <tr>
        <td colSpan={cols} style={{ padding: 0, border: 'none' }}>
            <div style={styles.emptyState}>
                <Icon size={48} strokeWidth={1.5} opacity={0.5} />
                <span>{message}</span>
            </div>
        </td>
    </tr>
);

export const GenericBadge = ({ children, color, bg, icon: Icon, style = {} }) => (
    <span style={{
        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
        textTransform: 'uppercase', background: bg, color: color,
        border: `1px solid ${color}20`, display: 'inline-flex', alignItems: 'center', gap: '6px',
        ...style
    }}>
        {Icon && <Icon size={12} />}
        {children}
    </span>
);