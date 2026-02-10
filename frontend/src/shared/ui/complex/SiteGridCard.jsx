// frontend/src/shared/ui/complex/SiteGridCard.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import SiteCoverDisplay from './SiteCoverDisplay';
import ReportModal from './ReportModal';
import { AuthContext } from '../../../app/providers/AuthContext';
import { MoreVertical, ExternalLink, Trash, Edit, Globe, GlobeLock, Eye, Calendar, Star, Pause, FileText, Flag, Lock, AlertTriangle, Construction, Wrench } from 'lucide-react';

const SiteStatusBadge = ({ status }) => {
    const config = {
        published: { label: 'Опубліковано', color: '#38a169', bg: 'rgba(56, 161, 105, 0.1)', icon: Globe },
        draft: { label: 'Тех. Роботи', color: '#d69e2e', bg: 'rgba(214, 158, 46, 0.1)', icon: Construction },
        suspended: { label: 'Призупинено', color: '#e53e3e', bg: 'rgba(229, 62, 62, 0.1)', icon: Pause },
        private: { label: 'Прихований', color: '#805ad5', bg: 'rgba(128, 90, 213, 0.1)', icon: Lock },
        probation: { label: 'На модерації', color: '#d69e2e', bg: 'rgba(214, 158, 46, 0.1)', icon: AlertTriangle }
    };
    const s = config[status] || config.draft;
    const Icon = s.icon;
    return (
        <div 
            className="px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 w-fit"
            style={{ 
                backgroundColor: s.bg, 
                color: s.color, 
                borderColor: `${s.color}33`
            }}
        >
            <Icon size={12} /> {s.label}
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, onClick, href, className, style = {} }) => {
    const baseClass = "text-left px-3 py-2 bg-transparent border-none cursor-pointer text-(--platform-text-primary) text-sm flex items-center gap-2 w-full no-underline box-border rounded hover:bg-(--platform-bg) transition-colors";
    const content = (
        <>
            <Icon size={14} /> {label}
        </>
    );

    if (href) {
        return (
            <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${baseClass} ${className || ''}`}
                style={style}
                onClick={(e) => {
                   if (onClick) onClick(e);
                }}
            >
                {content}
            </a>
        );
    }

    return (
        <button 
            onClick={onClick}
            className={`${baseClass} ${className || ''}`}
            style={style}
        >
            {content}
        </button>
    );
};

const CardMenu = ({ site, isOwner, isAdmin, onToggleStatus, onDelete, onReport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const isLocked = site.status === 'suspended' || site.status === 'probation';
    return (
        <div ref={menuRef}>
            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`
                    absolute top-2.5 right-2.5 z-20 bg-black/40 backdrop-blur-xs rounded-full w-8 h-8 
                    flex items-center justify-center cursor-pointer border border-white/10 transition-colors p-0
                    hover:bg-(--platform-accent) hover:border-(--platform-accent)
                    ${isOpen ? 'bg-(--platform-accent) border-(--platform-accent)' : ''}
                `}
                title="Меню"
            >
                <MoreVertical size={16} color="white" />
            </button>
            
            {isOpen && (
                <div 
                    className="absolute top-11.5 right-2.5 bg-(--platform-card-bg) border border-(--platform-border-color) rounded-lg shadow-lg min-w-50 p-1 flex flex-col z-30 animate-in fade-in slide-in-from-top-1 duration-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MenuItem 
                        icon={ExternalLink} 
                        label="Відвідати" 
                        href={`/site/${site.site_path}`}
                        onClick={() => setIsOpen(false)}
                    />

                    {!isOwner && !isAdmin && (
                        <MenuItem 
                            icon={Flag} 
                            label="Поскаржитись" 
                            onClick={() => { setIsOpen(false); onReport(); }}
                        />
                    )}
                    
                    {isOwner && !isAdmin && (
                        <>
                            {!isLocked && (
                                <>
                                    <MenuItem 
                                        icon={site.status === 'published' ? GlobeLock : Globe} 
                                        label={site.status === 'published' ? 'Зняти з публікації' : 'Опублікувати'}
                                        onClick={(e) => { 
                                            setIsOpen(false); 
                                            onToggleStatus(site, site.status === 'published' ? 'draft' : 'published'); 
                                        }}
                                    />

                                    {site.status !== 'private' ? (
                                        <MenuItem 
                                            icon={Lock} 
                                            label="Приховати (Приватний)"
                                            onClick={(e) => { 
                                                setIsOpen(false); 
                                                onToggleStatus(site, 'private'); 
                                            }}
                                        />
                                    ) : (
                                        <MenuItem 
                                            icon={FileText} 
                                            label="Зробити чернеткою"
                                            onClick={(e) => { 
                                                setIsOpen(false); 
                                                onToggleStatus(site, 'draft'); 
                                            }}
                                        />
                                    )}
                                </>
                            )}

                            {isLocked && (
                                <div className="px-3 py-2 text-[11px] text-(--platform-danger) italic text-center">
                                    Зміна статусу заблокована
                                </div>
                            )}
                            
                            <div className="h-px bg-(--platform-border-color) my-1" />
                        </>
                    )}

                    {(isOwner || isAdmin) && (
                        <MenuItem 
                            icon={Trash} 
                            label="Видалити" 
                            style={{ color: 'var(--platform-danger)' }}
                            onClick={(e) => { setIsOpen(false); onDelete(e, site.site_path, site.title); }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

const SiteGridCard = ({ 
    site, 
    variant = 'public',
    onTagClick, 
    onDelete, 
    onToggleStatus, 
    onTogglePin, 
    onToggleFavorite, 
    isFavorite,
    formatDate 
}) => {
    const [isReportOpen, setIsReportOpen] = useState(false);
    const { user } = useContext(AuthContext);
    const isUserAdmin = user?.role === 'admin';
    const isOwner = variant === 'owner';
    const isEffectiveAdmin = variant === 'admin' || isUserAdmin;
    const mainLink = isOwner ? `/dashboard/${site.site_path}` : `/site/${site.site_path}`;
    const isPinnedOrFav = isOwner ? site.is_pinned : isFavorite;
    const isSuspended = site.status === 'suspended';
    const isDraft = site.status === 'draft';

    return (
        <>
            <div className={`
                bg-(--platform-card-bg) rounded-xl border border-(--platform-border-color) overflow-hidden flex flex-col relative h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg
                ${isDraft ? 'border-dashed border-(--platform-border-color) bg-[repeating-linear-gradient(45deg,var(--platform-card-bg),var(--platform-card-bg)_10px,var(--platform-bg)_10px,var(--platform-bg)_20px)]' : ''}
            `}>
                <button 
                    className="absolute top-2.5 left-2.5 z-20 bg-black/40 backdrop-blur-xs rounded-full w-8 h-8 flex items-center justify-center cursor-pointer border border-white/10 transition-colors p-0 hover:bg-black/60"
                    onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        if (isOwner && onTogglePin) onTogglePin(site.id);
                        if (!isOwner && onToggleFavorite) onToggleFavorite(site.id);
                    }}
                    title={isOwner ? "Закріпити" : "В обране"}
                    style={{ 
                        color: isPinnedOrFav ? '#FFD700' : 'white',
                        borderColor: isPinnedOrFav ? '#FFD700' : 'rgba(255,255,255,0.1)'
                    }}
                >
                    <Star size={16} fill={isPinnedOrFav ? "currentColor" : "none"} />
                </button>
                
                <CardMenu 
                    site={site} 
                    isOwner={isOwner} 
                    isAdmin={isEffectiveAdmin} 
                    onToggleStatus={onToggleStatus} 
                    onDelete={onDelete} 
                    onReport={() => setIsReportOpen(true)}
                />

                <Link 
                    to={isSuspended ? '#' : mainLink} 
                    className={`
                        block w-full h-45 overflow-hidden border-b border-(--platform-border-color) relative
                        ${isSuspended ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <SiteCoverDisplay 
                        site={site} 
                        className="w-full h-full object-cover"
                        style={{ 
                            filter: isSuspended ? 'grayscale(1)' : (isDraft ? 'blur(1px) grayscale(0.3)' : 'none') 
                        }} 
                    />

                    {isDraft && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-amber-400 backdrop-blur-[2px] text-center p-4 z-10 transition-opacity duration-200 group-hover:bg-black/75">
                            <Construction size={40} className="mb-2" />
                            <div className="font-bold text-lg uppercase tracking-widest">
                                Технічні роботи
                            </div>
                            <div className="text-xs opacity-90 mt-1">
                                Сайт оновлюється
                            </div>
                        </div>
                    )}
                </Link>

                <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                        <div className="overflow-hidden">
                            <Link 
                                to={isSuspended ? '#' : mainLink} 
                                className={`block no-underline text-inherit ${isSuspended ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <h3 
                                    className={`
                                        m-0 text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis no-underline
                                        ${isDraft ? 'opacity-80' : ''}
                                    `}
                                    title={site.title}
                                >
                                    {site.title}
                                </h3>
                            </Link>

                            {!isOwner && (
                                <div className="text-xs text-(--platform-text-secondary) mt-1">
                                    Автор: <span className="text-(--platform-text-primary) font-medium">{site.author}</span>
                                </div>
                            )}
                        </div>
                        {isOwner && <SiteStatusBadge status={site.status} />}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-sm text-(--platform-text-secondary)">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} /> {formatDate(site.created_at)}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye size={14} /> {site.view_count || 0}
                        </div>
                    </div>

                    <div className="flex gap-1.5 flex-wrap min-h-6.5">
                        {site.tags && site.tags.length > 0 ? site.tags.slice(0, 4).map(tag => (
                            <span 
                                key={tag.id}
                                className="text-xs px-2 py-0.5 rounded-xl bg-(--platform-bg) text-(--platform-text-secondary) border border-(--platform-border-color) cursor-pointer transition-all hover:bg-(--platform-accent) hover:text-white hover:border-(--platform-accent)"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTagClick && onTagClick(tag.id); }}
                            >
                                #{tag.name}
                            </span>
                        )) : (
                            <span className="text-xs text-(--platform-text-secondary) opacity-50">Без тегів</span>
                        )}
                    </div>
                    
                    <div className="mt-auto pt-3">
                        {isOwner ? (
                            isSuspended ? (
                                <button className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-lg bg-(--platform-border-color) text-(--platform-text-secondary) cursor-not-allowed opacity-70 font-medium text-sm border-none" disabled>
                                    <Lock size={16} /> Заблоковано
                                </button>
                            ) : (
                                <Link 
                                    to={`/dashboard/${site.site_path}`}
                                    className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-lg bg-(--platform-accent) text-white border-none font-medium text-sm cursor-pointer transition-all hover:bg-(--platform-accent-hover) no-underline outline-none"
                                >
                                    {isDraft ? (
                                        <><Wrench size={16} /> Налаштувати</>
                                    ) : (
                                        <><Edit size={16} /> Редагувати</>
                                    )}
                                </Link>
                            )
                        ) : (
                            <a 
                                href={`/site/${site.site_path}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`
                                    flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-lg border-none font-medium text-sm cursor-pointer transition-all no-underline outline-none
                                    ${isDraft 
                                        ? 'bg-(--platform-border-color) text-(--platform-text-secondary) cursor-not-allowed opacity-80' 
                                        : 'bg-(--platform-accent) text-white hover:bg-(--platform-accent-hover)'}
                                `}
                            >
                                {isDraft ? (
                                    <><Construction size={16} /> Роботи</>
                                ) : (
                                    <><ExternalLink size={16} /> Відвідати</>
                                )}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <ReportModal 
                isOpen={isReportOpen} 
                onClose={() => setIsReportOpen(false)} 
                siteId={site.id} 
            />
        </>
        
    );
};

export default SiteGridCard;