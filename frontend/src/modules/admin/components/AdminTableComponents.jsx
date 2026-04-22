// frontend/src/modules/admin/components/AdminTableComponents.jsx
import React from 'react';
import { Button } from '../../../shared/ui/elements/Button';
import LoadingState from '../../../shared/ui/complex/LoadingState';
import { ArrowUp, ArrowDown, Inbox, Download } from 'lucide-react';

export const FilterBar = ({ children, className = '', style = {} }) => (
    <div className={`flex gap-3 items-center flex-wrap w-full ${className}`} style={style}>
        {children}
    </div>
);

export const CsvExportButton = ({ onClick, disabled, loading, className = '', style = {} }) => (
    <Button 
        variant="outline" 
        onClick={onClick} 
        disabled={disabled || loading} 
        title="Експорт у CSV" 
        className={`h-10 sm:h-10.5 px-3 sm:px-4 ${className}`}
        style={style}
    >
        <Download size={18} />
        <span className="ml-2 hidden sm:inline">CSV</span>
    </Button>
);

export const SortIcon = ({ active, direction }) => {
    if (!active) return <div className="w-3.5 h-3.5 opacity-0 shrink-0" />; 
    return direction === 'asc' ? <ArrowUp size={14} className="shrink-0" /> : <ArrowDown size={14} className="shrink-0" />;
};

export const AdminTable = ({ children, minWidth = '800px' }) => (
    <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) overflow-hidden flex flex-col w-full shadow-sm flex-1">
        <div className="overflow-x-auto custom-scrollbar w-full flex-1">
            <table className="w-full border-collapse text-sm sm:text-[15px] text-left" style={{ minWidth }}>
                {children}
            </table>
        </div>
    </div>
);

export const AdminTh = ({ label, sortKey, currentSort, onSort, width, align = 'left', className = '', style = {} }) => (
    <th 
        className={`
            p-3 sm:px-5 sm:py-4 bg-(--platform-bg) text-(--platform-text-secondary) font-semibold 
            sticky top-0 z-10 border-b border-(--platform-border-color) whitespace-nowrap select-none transition-colors
            ${sortKey ? 'cursor-pointer hover:bg-(--platform-hover-bg)' : 'cursor-default'}
            ${className}
        `}
        style={{ width, textAlign: align, ...style }}
        onClick={() => sortKey && onSort && onSort(sortKey)}
    >
        <div className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
            {label}
            {sortKey && currentSort && <SortIcon active={currentSort.key === sortKey} direction={currentSort.direction} />}
        </div>
    </th>
);

export const AdminRow = ({ children, onClick, isSelected, className = '', style = {} }) => (
    <tr 
        onClick={onClick} 
        className={`
            transition-colors border-b border-(--platform-border-color) last:border-0
            ${isSelected ? 'bg-(--platform-hover-bg)' : 'bg-transparent'}
            ${onClick ? 'cursor-pointer hover:bg-(--platform-hover-bg)' : 'cursor-default'}
            ${className}
        `}
        style={style}
    >
        {children}
    </tr>
);

export const AdminCell = ({ children, className = '', style = {}, align = 'left', colSpan }) => (
    <td 
        colSpan={colSpan} 
        className={`p-3 sm:px-5 sm:py-4 text-(--platform-text-primary) align-middle ${className}`}
        style={{ textAlign: align, ...style }}
    >
        {children}
    </td>
);

export const LoadingRow = ({ cols = 5 }) => (
    <tr>
        <td colSpan={cols} className="p-0 border-none">
            <div className="py-12">
                <LoadingState 
                    title="Завантаження даних..." 
                    layout="section" 
                    iconSize={32} 
                />
            </div>
        </td>
    </tr>
);

export const EmptyRow = ({ cols = 5, message = "Даних не знайдено", icon: Icon = Inbox }) => (
    <tr>
        <td colSpan={cols} className="p-0 border-none">
            <div className="flex flex-col items-center justify-center w-full min-h-[40vh] sm:min-h-[50vh] text-(--platform-text-secondary) gap-4 p-8">
                <Icon size={48} strokeWidth={1.5} className="opacity-50" />
                <span className="text-sm sm:text-base">{message}</span>
            </div>
        </td>
    </tr>
);

export const GenericBadge = ({ children, color, bg, icon: Icon, className = '', style = {} }) => (
    <span 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wide border ${className}`}
        style={{ 
            background: bg || 'var(--platform-bg)', 
            color: color || 'var(--platform-text-primary)', 
            borderColor: color ? `${color}40` : 'var(--platform-border-color)',
            ...style 
        }}
    >
        {Icon && <Icon size={12} className="shrink-0" />}
        <span className="truncate max-w-30 sm:max-w-none">{children}</span>
    </span>
);