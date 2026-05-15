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
                transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full
                ${isSelected ? 'shadow-md border-(--platform-accent) ring-1 ring-(--platform-accent)' : 'border-(--platform-border-color)'}
            `}
        >
            <div className="w-full h-28 lg:h-32 overflow-hidden border-b border-(--platform-border-color) relative bg-(--platform-bg) flex items-center justify-center shrink-0 group">
                {hasValidImage ? (
                    <img src={imageUrl} alt={template.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-(--platform-bg) to-(--platform-card-bg)">
                        <CategoryIcon size={32} className="text-(--platform-text-secondary) opacity-30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                {badge && (
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 pr-10 pointer-events-none">
                        {badge}
                    </div>
                )}
                {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-(--platform-accent) text-white flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                        <Check size={14} strokeWidth={3} />
                    </div>
                )}
            </div>
            <div className="p-3 lg:p-4 flex-1 flex flex-col gap-2">
                <h3 className="m-0 text-base font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-(--platform-text-primary)" title={template.name}>
                    {template.name}
                </h3>
                {template.description && (
                    <div className="text-[11px] lg:text-xs text-(--platform-text-secondary) line-clamp-2" title={template.description}>
                        {template.description}
                    </div>
                )}
                <div className="flex justify-between items-center mt-auto pt-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-(--platform-text-secondary)">
                        <CategoryIcon size={14} className="opacity-70" /> 
                        <span className="truncate max-w-25">{getCategoryLabel(template.category) || 'Загальне'}</span>
                    </div>
                    {actions && (
                        <div className="flex items-center gap-0.5 z-10 relative" onClick={(e) => e.stopPropagation()}>
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TemplateCard;