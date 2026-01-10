// frontend/src/modules/renderer/pages/CatalogPage.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import SiteCoverDisplay from '../../../shared/ui/complex/SiteCoverDisplay';
import { 
  IconUser, IconCalendar, IconExternalLink, IconSad, IconLoading, IconEye, IconPlus, 
  IconStar, IconUserOff, IconDotsVertical
} from '../../../shared/ui/elements/Icons';
import SiteFilters from '../../../shared/ui/complex/SiteFilters';
import { Button } from '../../../shared/ui/elements/Button';
import { AuthContext } from '../../../app/providers/AuthContext';
import { FavoritesContext } from '../../../app/providers/FavoritesContext';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 16;
const API_URL = 'http://localhost:5000';

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

const CatalogCardMenu = ({ site }) => {
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
                title="Меню"
            >
                <IconDotsVertical size={18} />
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
                    minWidth: '180px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '4px'
                }}>
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
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--platform-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                        <IconExternalLink size={16} /> Відвідати
                    </a>
                </div>
            )}
        </div>
    );
};

const SiteGridCard = ({ site, onTagClick, formatDate, isFavorite, onToggleFavorite }) => {
    const [isVisitHovered, setIsVisitHovered] = useState(false);
    const [isAuthorHovered, setIsAuthorHovered] = useState(false);
    const [hoveredTagId, setHoveredTagId] = useState(null);
    
    const getVisitButtonStyle = (isHovered = false) => ({
        padding: '10px 16px', 
        fontSize: '0.9rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        backgroundColor: isHovered ? 'var(--platform-accent-hover)' : 'var(--platform-accent)',
        color: 'var(--platform-accent-text)', 
        borderRadius: '8px', 
        textDecoration: 'none', 
        fontWeight: '500',
        transition: 'all 0.2s ease', 
        border: 'none', 
        justifyContent: 'center', 
        cursor: 'pointer', 
        width: '100%'
    });

    const userAvatarUrl = site.author_avatar ? (site.author_avatar.startsWith('http') ? site.author_avatar : `${API_URL}${site.author_avatar}`) : null;

    return (
        <div style={{ background: 'var(--platform-card-bg)', borderRadius: '12px', border: '1px solid var(--platform-border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'relative', height: '100%' }}
             onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
             onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}>
            
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(site.id); }}
                style={{
                    ...overlayButtonStyle,
                    position: 'absolute', 
                    top: '12px', left: '12px', zIndex: 20,
                    color: isFavorite ? '#FFD700' : 'white',
                    borderColor: isFavorite ? '#FFD700' : 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'}
                title={isFavorite ? "Видалити з обраних" : "Додати в обрані"}>
                <IconStar size={18} filled={isFavorite} />
            </button>

            <CatalogCardMenu site={site} />

            <Link to={`/site/${site.site_path}`} style={{ height: '180px', width: '100%', display: 'block', overflow: 'hidden', borderBottom: '1px solid var(--platform-border-color)', textDecoration: 'none' }}>
                <SiteCoverDisplay site={site} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
            </Link>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0.75rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--platform-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>НАЗВА</div>
                        <Link to={`/site/${site.site_path}`} style={{ textDecoration: 'none' }} title={site.title}>
                            <div style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: 'var(--platform-text-primary)', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                display: '-webkit-box', 
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical', 
                                lineHeight: '1.3',
                                wordBreak: 'break-word',
                                minHeight: '2.6em'
                            }}>
                                {site.title}
                            </div>
                        </Link>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--platform-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>АВТОР</div>
                        <Link to={`/profile/${site.author}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '2px', borderRadius: '6px', width: 'fit-content', color: isAuthorHovered ? 'var(--platform-accent)' : 'var(--platform-text-primary)', transition: 'color 0.2s ease' }} onMouseEnter={() => setIsAuthorHovered(true)} onMouseLeave={() => setIsAuthorHovered(false)}>
                            {userAvatarUrl ? <img src={userAvatarUrl} alt={site.author} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--platform-border-color)', flexShrink: 0 }} /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--platform-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--platform-accent-text)', fontSize: '0.7rem', fontWeight: '600', flexShrink: 0 }}>{site.author ? site.author.charAt(0).toUpperCase() : 'U'}</div>}
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500', maxWidth: '100px' }}>{site.author}</span>
                        </Link>
                    </div>
                </div>
                
                <div style={{ height: '1px', backgroundColor: 'var(--platform-border-color)', marginBottom: '0.75rem', opacity: 0.5 }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--platform-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ДАТА</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>
                            <IconCalendar size={14} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatDate(site.created_at)}</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--platform-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ПЕРЕГЛЯДИ</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--platform-text-primary)', fontSize: '0.9rem' }}>
                            <IconEye size={14} />
                            <span>{site.view_count || 0}</span>
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem', minHeight: '32px' }}>
                    {site.tags && site.tags.length > 0 ? site.tags.slice(0, 5).map(tag => (
                        <span key={tag.id} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTagClick(tag.id); }} className="site-tag" title={`Фільтрувати за тегом #${tag.name}`} style={{ fontSize: '0.75rem', color: hoveredTagId === tag.id ? 'var(--platform-accent-text)' : 'var(--platform-text-secondary)', background: hoveredTagId === tag.id ? 'var(--platform-accent)' : 'var(--platform-bg)', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${hoveredTagId === tag.id ? 'var(--platform-accent)' : 'var(--platform-border-color)'}`, cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-block' }} onMouseEnter={() => setHoveredTagId(tag.id)} onMouseLeave={() => setHoveredTagId(null)}>#{tag.name}</span>
                    )) : <span style={{ fontSize: '0.75rem', color: 'var(--platform-text-secondary)', opacity: 0.5 }}>Без тегів</span>}
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <a href={`/site/${site.site_path}`} target="_blank" rel="noopener noreferrer" style={getVisitButtonStyle(isVisitHovered)} onMouseEnter={() => setIsVisitHovered(true)} onMouseLeave={() => setIsVisitHovered(false)} title="Відкрити сайт у новій вкладці">Відвідати <IconExternalLink size={14} /></a>
                </div>
            </div>
        </div>
    );
};

const CatalogPage = () => {
    const [sites, setSites] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [sortOption, setSortOption] = useState('created_at:desc');
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [onlyFavorites, setOnlyFavorites] = useState(searchParams.get('favorites') === 'true');
    const [hideMySites, setHideMySites] = useState(false);

    const searchTimeoutRef = useRef(null);
    const { user } = useContext(AuthContext);
    const { favoriteSiteIds, addFavorite, removeFavorite } = useContext(FavoritesContext);

    useEffect(() => {
        apiClient.get('/tags').then(res => setTags(res.data)).catch(console.error);
        fetchSites();
    }, []);

    const fetchSites = async () => {
        setLoading(true);
        try {
            const params = { 
                search: searchTerm, 
                sort: sortOption,
                tag: selectedTag,
                onlyFavorites: onlyFavorites
            };
            const response = await apiClient.get('/sites/catalog', { params });
            setSites(response.data);
            setVisibleCount(ITEMS_PER_PAGE);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => { fetchSites(); }, 500);
        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, [searchTerm, selectedTag, sortOption, onlyFavorites]);

    const handleSearchSubmit = () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); fetchSites(); };
    const handleClearSearch = () => { setSearchTerm(''); setSelectedTag(null); };
    const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const handleTagClick = (tagId) => { setSelectedTag(tagId); };

    const handleToggleFavoritesFilter = () => {
        if (!user) {
            toast.info("Увійдіть, щоб переглянути обране");
            return;
        }
        setOnlyFavorites(!onlyFavorites);
    };

    const handleToggleFavorite = async (siteId) => {
        if (!user) {
            toast.info("Будь ласка, увійдіть, щоб додавати сайти в обране");
            return;
        }
        if (favoriteSiteIds.has(siteId)) {
            await removeFavorite(siteId);
            toast.info("Сайт видалено з обраних");
        } else {
            await addFavorite(siteId);
            toast.success("Сайт додано в обране");
        }
    };

    const filteredSites = sites.filter(site => {
        if (hideMySites && user && site.author === user.username) return false;
        return true;
    });

    const visibleSites = filteredSites.slice(0, visibleCount);

    const gridStyles = `
        .sites-grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; width: 100%; }
        @media (min-width: 600px) { .sites-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 900px) { .sites-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1200px) { .sites-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1600px) { .sites-grid { grid-template-columns: repeat(4, 1fr); } }
        .site-tag { font-size: 0.75rem; color: var(--platform-text-secondary); background: var(--platform-bg); padding: 2px 8px; border-radius: 6px; border: 1px solid var(--platform-border-color); cursor: pointer; transition: all 0.2s ease; display: inline-block; }
        .site-tag:hover { background: var(--platform-accent); color: var(--platform-accent-text); border-color: var(--platform-accent); transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    `;

    return (
        <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '2rem', minHeight: '100vh', scrollbarGutter: 'stable', boxSizing: 'border-box', width: '100%' }}>
            <style>{gridStyles}</style>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--platform-text-primary)', marginBottom: '0.5rem', marginTop: 0 }}>Каталог Сайтiв</h1>
                <p style={{ color: 'var(--platform-text-secondary)', fontSize: '1rem', margin: 0 }}>Відкрийте для себе найкращі проекти, створені на Kendr</p>
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
                isStarActive={onlyFavorites}
                onStarClick={handleToggleFavoritesFilter}
                starTitle={onlyFavorites ? "Показати всі" : "Тільки обрані"}
                
                extraButtons={user && (
                    <Button 
                        variant="toggle-danger"
                        active={hideMySites}
                        onClick={() => setHideMySites(!hideMySites)}
                        title={hideMySites ? "Показати мої сайти" : "Приховати мої сайти"}
                        style={{ height: '38px', width: '38px' }}
                    >
                        <IconUserOff size={16} />
                    </Button>
                )}
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--platform-text-secondary)' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><IconLoading size={48} /></div>
                    Завантаження...
                </div>
            ) : filteredSites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--platform-card-bg)', borderRadius: '12px', border: '1px solid var(--platform-border-color)', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--platform-text-secondary)', display: 'flex', justifyContent: 'center' }}><IconSad size={64} /></div>
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>Нічого не знайдено</h3>
                    <p style={{ color: 'var(--platform-text-secondary)', marginBottom: '1.5rem' }}>Спробуйте змінити параметри пошуку</p>
                    <Button onClick={handleClearSearch} variant="primary">Очистити фільтри</Button>
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
                                isFavorite={favoriteSiteIds.has(site.id)}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))}
                    </div>

                    {filteredSites.length > visibleCount && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <Button onClick={handleLoadMore} variant="secondary" style={{ padding: '12px 30px' }}>
                                <IconPlus size={16} /> Завантажити ще ({filteredSites.length - visibleCount})
                            </Button>
                        </div>
                    )}
               </>
            )}
        </div>
    );
};

export default CatalogPage;