// frontend/src/shared/ui/complex/TemplateCard.jsx
import React from 'react';
import { getCategoryLabel } from '../../utils/templateUtils';
import { Check, Layout, Briefcase, ShoppingBag, Camera, Globe, FileText, Palette } from 'lucide-react';

const CATEGORY_ICONS = {
    'General': Layout,
    'Business': Briefcase,
    'Store': ShoppingBag,
    'Portfolio': Camera,
    'Landing': Globe,
    'Blog': FileText,
    'Creative': Palette
};

const TemplateCard = ({ template, isSelected, onClick, actions, badge, getFullUrl }) => {
    const CategoryIcon = CATEGORY_ICONS[template.category] || CATEGORY_ICONS['General'];
    const hasValidImage = template.thumbnail_url && template.thumbnail_url !== 'null' && !template.thumbnail_url.includes('empty.png');
    const imageUrl = hasValidImage 
        ? (getFullUrl && !template.thumbnail_url.startsWith('data:') ? getFullUrl(template.thumbnail_url) : template.thumbnail_url) 
        : null;
    return (
        <div 
            onClick={onClick}
            className={`
                bg-(--platform-card-bg) rounded-xl border overflow-hidden flex flex-col relative 
                transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full
                ${isSelected ? 'shadow-md border-2 border-(--platform-accent)' : 'border border-(--platform-border-color)'}
            `}
        >
            <div className="w-full h-28 lg:h-32 overflow-hidden border-b border-(--platform-border-color) relative bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-repeat bg-(--platform-bg) flex items-center justify-center shrink-0">
                {hasValidImage ? (
                    <img src={imageUrl} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                    <CategoryIcon size={40} className="text-(--platform-text-secondary) opacity-40" />
                )}
                {badge && (
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                        {badge}
                    </div>
                )}
                {isSelected && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-(--platform-accent) text-white flex items-center justify-center shadow-md animate-[popIn_0.2s_ease-out] border-2 border-white dark:border-gray-800">
                        <Check size={16} strokeWidth={3} />
                    </div>
                )}
            </div>
            <div className="p-3 lg:p-4 flex-1 flex flex-col gap-2 lg:gap-3">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="m-0 text-base xl:text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-(--platform-text-primary)" title={template.name}>
                        {template.name}
                    </h3>
                </div>
                {template.description && (
                    <div className="text-[11px] lg:text-xs text-(--platform-text-secondary) line-clamp-2 opacity-80" title={template.description}>
                        {template.description}
                    </div>
                )}
                <div className="flex justify-between items-center mt-auto pt-2 lg:pt-3 border-t border-(--platform-border-color)">
                    <div className="flex items-center gap-1.5 text-[10px] lg:text-[11px] font-medium text-(--platform-text-secondary) bg-(--platform-bg) px-2 py-1 rounded-lg border border-(--platform-border-color) shadow-sm">
                        <CategoryIcon size={14} className="text-(--platform-text-primary) opacity-70" /> 
                        <span className="truncate max-w-17.5 xl:max-w-25">{getCategoryLabel(template.category) || 'Загальне'}</span>
                    </div>
                    {actions && (
                        <div className="flex items-center gap-1 z-10 relative" onClick={(e) => e.stopPropagation()}>
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateCard;