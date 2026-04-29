// frontend/src/shared/ui/complex/SiteFilters.jsx
import React, { useMemo } from 'react';
import { Button, Input } from '../elements';
import CustomSelect from '../elements/CustomSelect';
import { Search, X, Star, ArrowUp, ArrowDown } from 'lucide-react';

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

    return (
        <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 border-b border-(--platform-border-color) bg-(--platform-bg) shrink-0">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
                <div className="flex-1 w-full h-10 min-w-50">
                    <Input
                        placeholder="Пошук..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit && onSearchSubmit()}
                        leftIcon={<Search size={18} />}
                        rightIcon={searchTerm ? <X size={16} onClick={() => onSearchChange('')} className="cursor-pointer hover:text-(--platform-text-primary) transition-colors" /> : null}
                        wrapperStyle={{ margin: 0, height: '100%' }}
                        className="h-full w-full"
                    />
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 h-10">
                    <div className="flex-1 sm:flex-none sm:w-48 h-full">
                        <CustomSelect
                            value={currentField}
                            onChange={handleFieldChange}
                            options={selectOptions}
                            placeholder="Сортування"
                            style={{ height: '100%', margin: 0 }}
                            className="h-full m-0"
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={toggleDirection}
                        className="h-10 w-10 flex items-center justify-center shrink-0 rounded-lg border border-(--platform-border-color) bg-(--platform-card-bg) text-(--platform-text-secondary) hover:border-(--platform-accent) hover:text-(--platform-accent) transition-colors shadow-sm"
                        title={currentDirection === 'asc' ? "За зростанням" : "За спаданням"}
                    >
                        {currentDirection === 'asc' ? (
                            <ArrowUp size={20} strokeWidth={2.5} />
                        ) : (
                            <ArrowDown size={20} strokeWidth={2.5} />
                        )}
                    </button>
                    {showStarFilter && (
                        <button
                            type="button"
                            onClick={onStarClick}
                            title={starTitle}
                            className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border transition-colors shadow-sm
                                ${isStarActive 
                                    ? 'border-(--platform-accent) bg-[color-mix(in_srgb,var(--platform-accent),transparent_90%)] text-(--platform-accent)' 
                                    : 'border-(--platform-border-color) bg-(--platform-card-bg) text-(--platform-text-secondary) hover:border-(--platform-text-secondary)'
                                }
                            `}
                        >
                            <Star size={20} fill={isStarActive ? "currentColor" : "none"} strokeWidth={isStarActive ? 1.5 : 2} />
                        </button>
                    )}
                    
                    {extraButtons}
                </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {tags && tags.length > 0 && (
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-(--platform-text-secondary) uppercase tracking-wide px-1">
                            Теги:
                        </span>
                        <button
                            type="button"
                            className={`h-8 px-3.5 rounded-full border text-xs font-medium whitespace-nowrap transition-colors flex items-center shrink-0 cursor-pointer 
                                ${!selectedTag 
                                    ? 'border-(--platform-accent) text-(--platform-accent) bg-[color-mix(in_srgb,var(--platform-accent),transparent_90%)]' 
                                    : 'border-(--platform-border-color) text-(--platform-text-secondary) bg-transparent hover:bg-(--platform-hover-bg)'
                                }
                            `}
                            onClick={() => onTagSelect(null)}
                        >
                            Всі
                        </button>
                        {tags.map(tag => {
                            const isActive = selectedTag === tag.id;
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className={`h-8 px-3.5 rounded-full border text-xs font-medium whitespace-nowrap transition-colors flex items-center shrink-0 cursor-pointer 
                                        ${isActive 
                                            ? 'border-(--platform-accent) text-(--platform-accent) bg-[color-mix(in_srgb,var(--platform-accent),transparent_90%)]' 
                                            : 'border-(--platform-border-color) text-(--platform-text-secondary) bg-transparent hover:bg-(--platform-hover-bg)'
                                        }
                                    `}
                                    onClick={() => onTagSelect(isActive ? null : tag.id)}
                                >
                                    {tag.name || tag.label}
                                </button>
                            );
                        })}
                    </div>
                )}
                {afterTags && (
                    <div className="flex items-center gap-2 shrink-0">
                        {tags.length > 0 && <div className="w-px h-5 bg-(--platform-border-color) mx-1 shrink-0" />}
                        {afterTags}
                    </div>
                )}
            </div>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default SiteFilters;