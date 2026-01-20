// frontend/src/shared/ui/complex/SiteFilters.jsx
import React, { useMemo } from 'react';
import { Search, X, Star, ArrowUp, ArrowDown, UserX } from 'lucide-react';
import { Button, Input } from '../elements';
import CustomSelect from '../elements/CustomSelect';

const FIELD_LABELS = {
    'created_at': 'За датою',
    'file_size_kb': 'За розміром',
    'original_file_name': 'За назвою',
    'display_name': 'За назвою',
    'title': 'За назвою',
    'views': 'За популярністю'
};

const SiteFilters = ({
    searchTerm,
    onSearchChange,
    onSearchSubmit,
    sortOption,
    onSortChange,
    sortOptions = [],
    tags = [],
    selectedTag,
    onTagSelect,
    showStarFilter = false,
    isStarActive = false,
    onStarClick,
    starTitle = "В обраному",
    extraButtons,
    afterTags 
}) => {
    
    const [currentField, currentDirection] = useMemo(() => {
        if (!sortOption) return ['created_at', 'desc'];
        const parts = sortOption.split(':');
        return [parts[0], parts[1] || 'desc'];
    }, [sortOption]);

    const selectOptions = useMemo(() => {
        const uniqueFields = new Set();
        const options = [];
        sortOptions.forEach(opt => {
            const [field] = opt.value.split(':');
            if (!uniqueFields.has(field)) {
                uniqueFields.add(field);
                options.push({
                    value: field,
                    label: FIELD_LABELS[field] || field
                });
            }
        });
        return options;
    }, [sortOptions]);

    const handleFieldChange = (e) => {
        const newField = e.target.value;
        onSortChange(`${newField}:${currentDirection}`);
    };

    const toggleDirection = () => {
        const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        onSortChange(`${currentField}:${newDirection}`);
    };

    const styles = {
        container: {
            padding: '12px 24px',
            borderBottom: '1px solid var(--platform-border-color)',
            backgroundColor: 'var(--platform-bg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        },
        topRow: {
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
        searchWrapper: {
            flex: '1 1 300px',
            minWidth: '200px',
        },
        controlsWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            marginLeft: 'auto',
        },
        tagsRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none'
        },
        tagButton: (isActive) => ({
            padding: '6px 14px',
            borderRadius: '20px',
            border: `1px solid ${isActive ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
            background: isActive ? 'color-mix(in srgb, var(--platform-accent), transparent 90%)' : 'transparent',
            color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }),
        divider: {
            width: '1px',
            height: '24px',
            backgroundColor: 'var(--platform-border-color)',
            margin: '0 4px',
            flexShrink: 0
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.topRow}>
                <div style={styles.searchWrapper}>
                    <Input
                        placeholder="Пошук..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit && onSearchSubmit()}
                        leftIcon={<Search size={18} />}
                        rightIcon={searchTerm ? <X size={16} onClick={() => onSearchChange('')} style={{ cursor: 'pointer' }} /> : null}
                        wrapperStyle={{ marginBottom: 0 }}
                        style={{ height: '40px' }}
                    />
                </div>

                <div style={styles.controlsWrapper}>
                    <div style={{ display: 'flex', gap: '8px', width: '220px' }}>
                        <div style={{ flex: 1 }}>
                            <CustomSelect
                                value={currentField}
                                onChange={handleFieldChange}
                                options={selectOptions}
                                placeholder="Сортування"
                                style={{ height: '40px' }}
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={toggleDirection}
                            style={{ width: '40px', height: '40px', padding: 0, flexShrink: 0 }}
                            title={currentDirection === 'asc' ? "За зростанням" : "За спаданням"}
                        >
                            {currentDirection === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                        </Button>
                    </div>

                    {showStarFilter && (
                        <Button
                            variant="square-accent"
                            active={isStarActive}
                            onClick={onStarClick}
                            title={starTitle}
                            style={{ height: '40px', width: '40px' }}
                        >
                            <Star size={18} fill={isStarActive ? "currentColor" : "none"} />
                        </Button>
                    )}
                    
                    {extraButtons}
                </div>
            </div>

            <div style={styles.tagsRow} className="custom-scrollbar">
                {tags && tags.length > 0 && (
                    <>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--platform-text-secondary)', marginRight: '4px' }}>
                            ТЕГИ:
                        </span>
                        
                        <button
                            style={styles.tagButton(!selectedTag)}
                            onClick={() => onTagSelect(null)}
                        >
                            Всі
                        </button>
                        
                        {tags.map(tag => (
                            <button
                                key={tag.id}
                                style={styles.tagButton(selectedTag === tag.id)}
                                onClick={() => onTagSelect(tag.id === selectedTag ? null : tag.id)}
                            >
                                {tag.name || tag.label}
                            </button>
                        ))}
                    </>
                )}

                {afterTags && (
                    <>
                        {tags.length > 0 && <div style={styles.divider} />}
                        {afterTags}
                    </>
                )}
            </div>
        </div>
    );
};

export default SiteFilters;