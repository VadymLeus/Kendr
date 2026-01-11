// frontend/src/modules/dashboard/pages/MySitesPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import SiteCoverDisplay from '../../../shared/ui/complex/SiteCoverDisplay';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { Edit, ExternalLink, Trash, Plus, Eye, Calendar, Frown, Loader, MoreVertical, Globe, GlobeLock, FileText, Pause, Pin, Star } from 'lucide-react';
import SiteFilters from '../../../shared/ui/complex/SiteFilters';

const ITEMS_PER_PAGE = 16;

const overlayButtonStyle = {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
};

const SiteStatusBadge = ({ status }) => {
    const config = {
        published: { label: 'Опубліковано', color: '#38a169', bg: 'rgba(56, 161, 105, 0.1)', icon: Globe },
        draft: { label: 'Чернетка', color: 'var(--platform-text-secondary)', bg: 'rgba(0,0,0,0.05)', icon: FileText },
        suspended: { label: 'Призупинено', color: '#dd6b20', bg: 'rgba(221, 107, 32, 0.1)', icon: Pause }
    };
    const s = config[status] || config.draft;
    const Icon = s.icon;

    return (
        <div style={{ 
            backgroundColor: s.bg, 
            color: s.color, 
            padding: '4px 8px', 
            borderRadius: '6px', 
            fontSize: '0.75rem', 
            fontWeight: '600', 
            border: `1px solid ${s.color}33`, 
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            width: 'fit-content'
        }}>
            <Icon size={12} />
            {s.label}
        </div>
    );
};

const SiteCardMenu = ({ site, onToggleStatus, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleAction = (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        action();
    };

    const isPublished = site.status === 'published';

    return (
        <div ref={menuRef} style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20 }}>
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                style={{
                    ...overlayButtonStyle,
                    background: isOpen ? 'var(--platform-accent)' : overlayButtonStyle.background
                }}
                onMouseEnter={e => !isOpen && (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)')}
                onMouseLeave={e => !isOpen && (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)')}
                title="Меню дій"
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '5px',
                    background: 'var(--platform-card-bg)', 
                    border: '1px solid var(--platform-border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    minWidth: '200px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '4px'
                }}>
                    {isPublished && (
                        <a
                            href={`/site/${site.site_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            style={{
                                textAlign: 'left',
                                padding: '10px 16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--platform-text-primary)',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                width: '100%',
                                textDecoration: 'none',
                                boxSizing: 'border-box'
                            }}
                            onMouseEnter={e => e.target.style.background = 'var(--platform-bg)'}
                            onMouseLeave={e => e.target.style.background = 'none'}
                        >
                            <ExternalLink size={16} /> Відвідати сайт
                        </a>
                    )}

                    <button
                        onClick={(e) => handleAction(e, () => onToggleStatus(site))}
                        style={{
                            textAlign: 'left',
                            padding: '10px 16px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--platform-text-primary)',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%'
                        }}
                        onMouseEnter={e => e.target.style.background = 'var(--platform-bg)'}
                        onMouseLeave={e => e.target.style.background = 'none'}
                    >
                        {isPublished ? <GlobeLock size={16} /> : <Globe size={16} />}
                        {isPublished ? 'Зняти з публікації' : 'Опублікувати'}
                    </button>

                    <div style={{ height: '1px', background: 'var(--platform-border-color)', margin: '4px 0' }} />

                    <button
                        onClick={(e) => handleAction(e, () => onDelete(e, site.site_path, site.title))}
                        style={{
                            textAlign: 'left',
                            padding: '10px 16px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#e53e3e',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%'
                        }}
                        onMouseEnter={e => e.target.style.background = '#fff5f5'}
                        onMouseLeave={e => e.target.style.background = 'none'}
                    >
                        <Trash size={16} /> Видалити
                    </button>
                </div>
            )}
        </div>
    );
};

const SiteGridCard = ({ site, onTagClick, formatDate, onDelete, onToggleStatus, onTogglePin }) => {
    const [hoveredTagId, setHoveredTagId] = useState(null);
    const isPinned = site.is_pinned;

    return (
        <div style={{ 
            background: 'var(--platform-card-bg)', 
            borderRadius: '12px', 
            border: '1px solid var(--platform-border-color)', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column', 
            transition: 'transform 0.2s, box-shadow 0.2s', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
            position: 'relative',
            height: '100%'
        }} 
        onMouseEnter={e => { 
            e.currentTarget.style.transform = 'translateY(-4px)'; 
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; 
        }} 
        onMouseLeave={e => { 
            e.currentTarget.style.transform = 'translateY(0)'; 
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; 
        }}>
            
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onTogglePin(site.id);
                }}
                style={{
                    ...overlayButtonStyle,
                    position: 'absolute',
                    top: '12px', left: '12px', zIndex: 20,
                    color: isPinned ? '#FFD700' : 'white',
                    borderColor: isPinned ? '#FFD700' : 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'}
                title={isPinned ? "Відкріпити" : "Закріпити зверху"}
            >
                <Star size={18} fill={isPinned ? "currentColor" : "none"} />
            </button>

            <SiteCardMenu site={site} onToggleStatus={onToggleStatus} onDelete={onDelete} />

            <Link to={`/dashboard/${site.site_path}`} style={{ 
                height: '180px', 
                width: '100%', 
                display: 'block', 
                overflow: 'hidden', 
                borderBottom: '1px solid var(--platform-border-color)', 
                textDecoration: 'none' 
            }}>
                <SiteCoverDisplay site={site} style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    transition: 'transform 0.3s ease' 
                }} />
            </Link>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '0.75rem'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ 
                            fontSize: '0.7rem', 
                            color: 'var(--platform-text-secondary)', 
                            fontWeight: '600', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.5px' 
                        }}>
                            НАЗВА
                        </div>
                        <Link to={`/dashboard/${site.site_path}`} style={{ textDecoration: 'none' }}>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '700', 
                                color: 'var(--platform-text-primary)', 
                                margin: '0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical'
                            }} title={site.title}>
                                {site.title}
                            </h3>
                        </Link>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ 
                            fontSize: '0.7rem', 
                            color: 'var(--platform-text-secondary)', 
                            fontWeight: '600', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.5px' 
                        }}>
                            СТАТУС
                        </div>
                        <SiteStatusBadge status={site.status} />
                    </div>
                </div>
                
                <div style={{ height: '1px', backgroundColor: 'var(--platform-border-color)', marginBottom: '0.75rem', opacity: 0.5 }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--platform-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            ДАТА
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>
                            <Calendar size={14} />
                            <span>{formatDate(site.created_at)}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--platform-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            ПЕРЕГЛЯДИ
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>
                            <Eye size={14} />
                            <span>{site.view_count || 0}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem', minHeight: '32px' }}>
                    {site.tags && site.tags.length > 0 ? site.tags.slice(0, 5).map(tag => (
                        <span 
                            key={tag.id} 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTagClick(tag.id); }} 
                            className="site-tag" 
                            style={{
                                fontSize: '0.75rem',
                                color: hoveredTagId === tag.id ? 'var(--platform-accent-text)' : 'var(--platform-text-secondary)',
                                background: hoveredTagId === tag.id ? 'var(--platform-accent)' : 'var(--platform-bg)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                border: `1px solid ${hoveredTagId === tag.id ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'inline-block'
                            }}
                            onMouseEnter={() => setHoveredTagId(tag.id)}
                            onMouseLeave={() => setHoveredTagId(null)}
                        >
                            #{tag.name}
                        </span>
                    )) : <span style={{ fontSize: '0.75rem', color: 'var(--platform-text-secondary)', opacity: 0.5 }}>Без тегів</span>}
                </div>

                <Link 
                    to={`/dashboard/${site.site_path}`}
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        background: 'var(--platform-accent)',
                        borderRadius: '8px',
                        color: 'var(--platform-accent-text)',
                        textDecoration: 'none',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        border: 'none',
                        width: '100%',
                        boxSizing: 'border-box'
                    }}
                    onMouseEnter={e => { e.target.style.background = 'var(--platform-accent-hover)'; }}
                    onMouseLeave={e => { e.target.style.background = 'var(--platform-accent)'; }}
                >
                    <Edit size={16} /> Редагувати
                </Link>

            </div>
        </div>
    );
};

const MySitesPage = () => {
    const [sites, setSites] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [sortOption, setSortOption] = useState('created_at:desc');
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [onlyPinned, setOnlyPinned] = useState(false);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        apiClient.get('/tags').then(res => setTags(res.data)).catch(console.error);
    }, [user, navigate]);

    const fetchMySites = async () => {
        try {
            setLoading(true);
            const params = { scope: 'my', search: searchTerm, sort: sortOption, tag: selectedTag };
            const response = await apiClient.get('/sites/catalog', { params });
            setSites(response.data);
            setVisibleCount(ITEMS_PER_PAGE);
        } catch (err) { 
            console.error(err);
            toast.error('Не вдалося завантажити ваші сайти.'); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        if (!user) return;
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => { fetchMySites(); }, 500);
        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, [searchTerm, selectedTag, sortOption, user]);

    const handleSearchSubmit = () => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        fetchMySites();
    };

    const handleClearSearch = () => { setSearchTerm(''); setSelectedTag(null); };
    const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const handleTagClick = (tagId) => { setSelectedTag(tagId); };

    const handleDeleteSite = async (e, sitePath, siteTitle) => {
        e.preventDefault(); e.stopPropagation();
        if (await confirm({ title: "Видалення сайту", message: `Видалити сайт "${siteTitle}"? Це незворотно.`, type: "danger", confirmLabel: "Так, видалити" })) {
            try {
                await apiClient.delete(`/sites/${sitePath}`);
                setSites(prev => prev.filter(site => site.site_path !== sitePath));
                toast.success('Сайт видалено!');
            } catch (err) { toast.error('Помилка при видаленні'); }
        }
    };

    const handleStatusChange = async (site) => {
        const isPublished = site.status === 'published';
        const newStatus = isPublished ? 'draft' : 'published';

        if (isPublished) {
            const isConfirmed = await confirm({
                title: `Зняти сайт з публікації?`,
                message: `Сайт "${site.title}" стане недоступним для відвідувачів. Ви впевнені?`,
                confirmLabel: "Так, зняти",
                cancelLabel: "Скасувати",
                type: "warning"
            });
            if (!isConfirmed) return;
        }

        try {
            await apiClient.put(`/sites/${site.site_path}/settings`, { status: newStatus });
            setSites(prev => prev.map(s => s.id === site.id ? { ...s, status: newStatus } : s));
            toast.success(`Статус сайту змінено на: ${newStatus === 'published' ? 'Опубліковано' : 'Чернетка'}`);
        } catch (err) {
            console.error(err);
            toast.error('Не вдалося змінити статус сайту');
        }
    };

    const handleTogglePin = async (siteId) => {
        try {
            const res = await apiClient.patch(`/sites/${siteId}/pin`);
            const newPinState = res.data.is_pinned;
            setSites(prev => prev.map(site => 
                site.id === siteId ? { ...site, is_pinned: newPinState } : site
            ));
            toast.success(newPinState ? "Сайт закріплено" : "Сайт відкріплено");
        } catch (error) {
            console.error(error);
            toast.error("Не вдалося змінити статус закріплення");
        }
    };

    const filteredSites = sites.filter(site => {
        if (onlyPinned && !site.is_pinned) return false;
        return true;
    }).sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return 0;
    });

    const visibleSites = filteredSites.slice(0, visibleCount);

    const gridStyles = `
        .sites-grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; width: 100%; }
        @media (min-width: 600px) { .sites-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .sites-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1200px) { .sites-grid { grid-template-columns: repeat(4, 1fr); } }
    `;

    return (
        <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '2rem', minHeight: '100vh', scrollbarGutter: 'stable', boxSizing: 'border-box', width: '100%' }}>
            <style>{gridStyles}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--platform-text-primary)', marginBottom: '0.5rem', marginTop: 0 }}>
                        Мої Сайти
                    </h1>
                    <p style={{ color: 'var(--platform-text-secondary)', fontSize: '1rem', margin: 0 }}>
                        Керуйте своїми проектами ({sites.length})
                    </p>
                </div>
                <Link to="/create-site" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', background: 'var(--platform-accent)', color: 'white', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                    <Plus /> Створити новий
                </Link>
            </div>

            <SiteFilters 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSearchSubmit={handleSearchSubmit}
                onClearSearch={handleClearSearch}
                sortOption={sortOption}
                onSortChange={setSortOption}
                tags={tags}
                selectedTag={selectedTag}
                onTagSelect={setSelectedTag}
                showStarFilter={true}
                isStarActive={onlyPinned}
                onStarClick={() => setOnlyPinned(!onlyPinned)}
                starTitle={onlyPinned ? "Показати всі" : "Тільки закріплені"}
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--platform-text-secondary)' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                         <Loader size={48} style={{ animation: 'spin 1s linear infinite' }} />
                         <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                    Завантаження...
                </div>
            ) : sites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--platform-card-bg)', borderRadius: '12px', border: '1px solid var(--platform-border-color)', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--platform-text-secondary)', display: 'flex', justifyContent: 'center' }}><Frown size={64} /></div>
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>Немає сайтів</h3>
                    <p style={{ color: 'var(--platform-text-secondary)', marginBottom: '1.5rem' }}>{searchTerm || selectedTag ? 'Нічого не знайдено за вашим запитом' : 'Ви ще не створили жодного сайту'}</p>
                    {!(searchTerm || selectedTag) ? (
                        <Link to="/create-site" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', background: 'var(--platform-accent)', color: 'white', textDecoration: 'none', fontWeight: '600' }}>
                            <Plus /> Створити перший сайт
                        </Link>
                    ) : (
                        <button onClick={handleClearSearch} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--platform-accent)', color: 'white', fontWeight: '600' }}>Очистити фільтри</button>
                    )}
                </div>
            ) : (
                <>
                    <div className="sites-grid">
                        {visibleSites.map(site => (
                            <SiteGridCard 
                                key={site.id} 
                                site={site} 
                                onTagClick={handleTagClick} 
                                formatDate={formatDate} 
                                onDelete={handleDeleteSite}
                                onToggleStatus={handleStatusChange}
                                onTogglePin={handleTogglePin}
                            />
                        ))}
                    </div>

                    {filteredSites.length > visibleCount && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button onClick={handleLoadMore} className="btn btn-secondary" style={{ padding: '12px 30px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <Plus size={16} /> Завантажити ще ({filteredSites.length - visibleCount})
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MySitesPage;