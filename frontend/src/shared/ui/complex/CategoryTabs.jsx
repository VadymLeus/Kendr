// frontend/src/shared/ui/complex/CategoryTabs.jsx
import React from 'react';
import { TEMPLATE_CATEGORIES } from '../../utils/templateUtils';

const CategoryTabs = ({ selectedCategory, onSelect }) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient-right">
            {TEMPLATE_CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={`
                        whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                        ${selectedCategory === cat.id 
                            ? 'bg-(--platform-text-primary) text-(--platform-bg) border-(--platform-text-primary)' 
                            : 'bg-(--platform-card-bg) text-(--platform-text-secondary) border-(--platform-border-color) hover:border-(--platform-text-secondary)'
                        }
                    `}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
};

export default CategoryTabs;