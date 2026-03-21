// frontend/src/shared/ui/elements/DateRangePicker.jsx
import React from 'react';
import { Calendar, ArrowRight, X } from 'lucide-react';

const DateRangePicker = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onClear
}) => {
    const hasValue = startDate || endDate;
    return (
        <div 
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--platform-card-bg)',
                padding: '0 14px',
                borderRadius: '8px',
                border: '1px solid var(--platform-border-color)',
                height: '42px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            className="focus-within:border-(--platform-accent) hover:border-[color-mix(in_srgb,var(--platform-border-color),var(--platform-text-primary)_10%)] shadow-sm"
        >
            <Calendar size={18} style={{ color: 'var(--platform-text-secondary)', flexShrink: 0 }} />
            <input 
                type="date" 
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    outline: 'none', 
                    fontSize: '14px',
                    color: startDate ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)', 
                    width: '115px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                }}
                className="custom-date-input"
                title="Від дати"
            />
            <ArrowRight size={14} style={{ color: 'var(--platform-text-secondary)', opacity: 0.5, flexShrink: 0 }} />
            <input 
                type="date" 
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    outline: 'none', 
                    fontSize: '14px', 
                    color: endDate ? 'var(--platform-text-primary)' : 'var(--platform-text-secondary)', 
                    width: '115px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                }}
                className="custom-date-input"
                title="До дати"
            />
            {hasValue && (
                <button 
                    onClick={onClear}
                    style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'var(--platform-text-secondary)', 
                        padding: '4px',
                        marginLeft: '4px',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                        flexShrink: 0
                    }}
                    className="hover:bg-(--platform-hover-bg) hover:text-(--platform-text-primary)"
                    title="Очистити дати"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default DateRangePicker;