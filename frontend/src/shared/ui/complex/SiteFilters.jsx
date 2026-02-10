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
        <div className="flex flex-col gap-4 p-5 border-b border-(--platform-border-color) bg-(--platform-bg)">
            <div className="flex flex-col md:flex-row items-center gap-3 w-full h-auto md:h-10">
                <div className="w-full md:flex-1 h-10">
                    <Input
                        placeholder="Пошук..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit && onSearchSubmit()}
                        leftIcon={<Search size={18} />}
                        rightIcon={searchTerm ? <X size={16} onClick={() => onSearchChange('')} className="cursor-pointer" /> : null}
                        wrapperStyle={{ marginBottom: 0, height: '100%' }}
                        className="h-full w-full"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end h-10">
                    <div className="w-45 shrink-0 h-full">
                        <CustomSelect
                            value={currentField}
                            onChange={handleFieldChange}
                            options={selectOptions}
                            placeholder="Сортування"
                            style={{ height: '100%' }}
                        />
                    </div>

                    <button 
                        type="button"
                        onClick={toggleDirection}
                        className="h-10 w-10 flex items-center justify-center shrink-0 rounded-lg border border-(--platform-border-color) bg-transparent text-(--platform-text-secondary) hover:border-(--platform-accent) hover:text-(--platform-accent) transition-all"
                        title={currentDirection === 'asc' ? "За зростанням" : "За спаданням"}
                    >
                        {currentDirection === 'asc' ? (
                            <ArrowUp size={20} strokeWidth={2.5} />
                        ) : (
                            <ArrowDown size={20} strokeWidth={2.5} />
                        )}
                    </button>

                    {showStarFilter && (
                        <Button
                            variant="square-accent"
                            active={isStarActive}
                            onClick={onStarClick}
                            title={starTitle}
                            className={`h-10 w-10 p-0 shrink-0 flex items-center justify-center border ${isStarActive ? 'border-(--platform-accent)' : 'border-(--platform-border-color)'}`}
                        >
                            <Star size={20} fill={isStarActive ? "currentColor" : "none"} />
                        </Button>
                    )}
                    
                    {extraButtons}
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {tags && tags.length > 0 && (
                    <>
                        <span className="text-xs font-bold text-(--platform-text-secondary) mr-1 shrink-0 uppercase tracking-wide">
                            Теги:
                        </span>
                        
                        <button
                            type="button"
                            className={`h-8 px-3.5 rounded-full border text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${!selectedTag ? 'border-(--platform-accent) text-(--platform-accent)' : 'border-(--platform-border-color) text-(--platform-text-secondary) hover:bg-(--platform-hover-bg)'}`}
                            style={!selectedTag ? { backgroundColor: 'color-mix(in srgb, var(--platform-accent), transparent 90%)' } : {}}
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
                                    className={`h-8 px-3.5 rounded-full border text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${isActive ? 'border-(--platform-accent) text-(--platform-accent)' : 'border-(--platform-border-color) text-(--platform-text-secondary) hover:bg-(--platform-hover-bg)'}`}
                                    style={isActive ? { backgroundColor: 'color-mix(in srgb, var(--platform-accent), transparent 90%)' } : {}}
                                    onClick={() => onTagSelect(isActive ? null : tag.id)}
                                >
                                    {tag.name || tag.label}
                                </button>
                            );
                        })}
                    </>
                )}

                {afterTags && (
                    <>
                        {tags.length > 0 && <div className="w-px h-5 bg-(--platform-border-color) mx-1 shrink-0" />}
                        {afterTags}
                    </>
                )}
            </div>
        </div>
    );
};

export default SiteFilters;