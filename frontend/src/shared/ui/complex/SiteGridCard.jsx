// frontend/src/shared/ui/complex/SiteGridCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteCoverDisplay from './SiteCoverDisplay';
import ReportModal from './ReportModal';
import { MoreVertical, ExternalLink, Trash, Edit, Globe, GlobeLock, Eye, Calendar, Star, Pause, FileText, Flag, Lock } from 'lucide-react';

const cardStyles = `
    .site-grid-card {
        background: var(--platform-card-bg);
        border-radius: 12px;
        border: 1px solid var(--platform-border-color);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        position: relative;
        height: 100%;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .site-grid-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.1);
    }

    .site-card-tag {
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 12px;
        background: var(--platform-bg);
        color: var(--platform-text-secondary);
        border: 1px solid var(--platform-border-color);
        cursor: pointer;
        transition: all 0.2s;
    }
    .site-card-tag:hover {
        background: var(--platform-accent);
        color: white !important;
        border-color: var(--platform-accent);
    }
    
    .site-card-fav-btn {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 20;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(4px);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid rgba(255,255,255,0.1);
        transition: background 0.2s;
        padding: 0;
    }
    .site-card-fav-btn:hover {
        background: rgba(0,0,0,0.6);
    }

    .site-card-menu-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 20;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(4px);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid rgba(255,255,255,0.1);
        transition: background 0.2s;
        padding: 0;
    }
    .site-card-menu-btn:hover, .site-card-menu-btn.active {
        background: var(--platform-accent);
        border-color: var(--platform-accent);
    }

    .site-card-action-btn {
        display: flex !important;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 10px 20px;
        border-radius: 8px;
        background: var(--platform-accent) !important;
        color: white !important;
        border: none;
        font-weight: 500;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: auto;
        text-decoration: none !important;
        outline: none;
    }

    .site-card-action-btn:hover {
        background: var(--platform-accent-hover) !important;
        text-decoration: none !important;
    }
    
    .site-card-dropdown {
        position: absolute;
        top: 46px;
        right: 10px;
        background: var(--platform-card-bg);
        border: 1px solid var(--platform-border-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 200px;
        padding: 4px;
        display: flex;
        flex-direction: column;
        z-index: 30;
        animation: fadeIn 0.1s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const SiteStatusBadge = ({ status }) => {
    const config = {
        published: { label: 'Опубліковано', color: '#38a169', bg: 'rgba(56, 161, 105, 0.1)', icon: Globe },
        draft: { label: 'Чернетка', color: 'var(--platform-text-secondary)', bg: 'rgba(0,0,0,0.05)', icon: FileText },
        suspended: { label: 'Призупинено', color: '#dd6b20', bg: 'rgba(221, 107, 32, 0.1)', icon: Pause },
        private: { label: 'Прихований', color: '#805ad5', bg: 'rgba(128, 90, 213, 0.1)', icon: Lock }
    };
    const s = config[status] || config.draft;
    const Icon = s.icon;
    return (
        <div style={{ 
            backgroundColor: s.bg, color: s.color, padding: '4px 8px', borderRadius: '6px', 
            fontSize: '0.75rem', fontWeight: '600', border: `1px solid ${s.color}33`, 
            display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content'
        }}>
            <Icon size={12} /> {s.label}
        </div>
    );
};

const menuItemStyle = {
    textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none',
    cursor: 'pointer', color: 'var(--platform-text-primary)', fontSize: '0.85rem',
    display: 'flex', alignItems: 'center', gap: '8px', width: '100%', textDecoration: 'none',
    boxSizing: 'border-box', borderRadius: '4px', transition: 'background 0.2s'
};

const MenuItem = ({ icon: Icon, label, onClick, href, className, style = {} }) => {
    const [hover, setHover] = useState(false);
    const content = (
        <>
            <Icon size={14} /> {label}
        </>
    );

    const finalStyle = hover ? { ...menuItemStyle, ...style, background: 'var(--platform-bg)' } : { ...menuItemStyle, ...style };
    if (href) {
        return (
            <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                style={finalStyle}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={className}
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
            style={finalStyle}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
            className={className}
        >
            {content}
        </button>
    );
};

const CardMenu = ({ site, isOwner, onToggleStatus, onDelete, onReport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div ref={menuRef}>
            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`site-card-menu-btn ${isOpen ? 'active' : ''}`}
                title="Меню"
            >
                <MoreVertical size={16} color="white" />
            </button>
            
            {isOpen && (
                <div className="site-card-dropdown" onClick={(e) => e.stopPropagation()}>
                    <MenuItem 
                        icon={ExternalLink} 
                        label="Відвідати" 
                        href={`/site/${site.site_path}`}
                        onClick={() => setIsOpen(false)}
                    />

                    {!isOwner && (
                        <MenuItem 
                            icon={Flag} 
                            label="Поскаржитись" 
                            onClick={() => { setIsOpen(false); onReport(); }}
                        />
                    )}
                    
                    {isOwner && (
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
                            
                            <div style={{ height: '1px', background: 'var(--platform-border-color)', margin: '4px 0' }} />
                            
                            <MenuItem 
                                icon={Trash} 
                                label="Видалити" 
                                style={{ color: 'var(--platform-danger)' }}
                                onClick={(e) => { setIsOpen(false); onDelete(e, site.site_path, site.title); }}
                            />
                        </>
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
    const isOwner = variant === 'owner';
    const mainLink = isOwner ? `/dashboard/${site.site_path}` : `/site/${site.site_path}`;
    const isPinnedOrFav = isOwner ? site.is_pinned : isFavorite;
    const noDecorationStyle = { 
        textDecoration: 'none', 
        color: 'inherit',
        border: 'none',
        display: 'block' 
    };

    return (
        <>
            <style>{cardStyles}</style>
            <div className="site-grid-card">
                <button 
                    className="site-card-fav-btn"
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
                    onToggleStatus={onToggleStatus} 
                    onDelete={onDelete} 
                    onReport={() => setIsReportOpen(true)}
                />

                <Link to={mainLink} style={{ ...noDecorationStyle, height: '180px', width: '100%', overflow: 'hidden', borderBottom: '1px solid var(--platform-border-color)' }}>
                    <SiteCoverDisplay site={site} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Link>

                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ overflow: 'hidden' }}>
                            <Link to={mainLink} style={noDecorationStyle}>
                                <h3 
                                    className="site-card-title" 
                                    style={{ 
                                        margin: 0, 
                                        fontSize: '1.1rem', 
                                        fontWeight: '600', 
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis',
                                        textDecoration: 'none'
                                    }} 
                                    title={site.title}
                                >
                                    {site.title}
                                </h3>
                            </Link>

                            {!isOwner && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--platform-text-secondary)', marginTop: '4px' }}>
                                    Автор: <span style={{ color: 'var(--platform-text-primary)', fontWeight: '500' }}>{site.author}</span>
                                </div>
                            )}
                        </div>
                        {isOwner && <SiteStatusBadge status={site.status} />}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', color: 'var(--platform-text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} /> {formatDate(site.created_at)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Eye size={14} /> {site.view_count || 0}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', minHeight: '26px' }}>
                        {site.tags && site.tags.length > 0 ? site.tags.slice(0, 4).map(tag => (
                            <span 
                                key={tag.id}
                                className="site-card-tag"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTagClick && onTagClick(tag.id); }}
                            >
                                #{tag.name}
                            </span>
                        )) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--platform-text-secondary)', opacity: 0.5 }}>Без тегів</span>
                        )}
                    </div>
                    
                    <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                        {isOwner ? (
                            <Link 
                                to={`/dashboard/${site.site_path}`}
                                className="site-card-action-btn"
                                style={noDecorationStyle}
                            >
                                <Edit size={16} /> Редагувати
                            </Link>
                        ) : (
                            <a 
                                href={`/site/${site.site_path}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="site-card-action-btn"
                                style={noDecorationStyle}
                            >
                                Відвідати <ExternalLink size={16} />
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