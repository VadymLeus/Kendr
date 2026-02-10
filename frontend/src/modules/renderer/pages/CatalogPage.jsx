// frontend/src/modules/renderer/pages/CatalogPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import { AuthContext } from '../../../app/providers/AuthContext';
import { FavoritesContext } from '../../../app/providers/FavoritesContext';
import { toast } from 'react-toastify';
import SiteFilters from '../../../shared/ui/complex/SiteFilters';
import SiteGridCard from '../../../shared/ui/complex/SiteGridCard';
import EmptyState from '../../../shared/ui/complex/EmptyState';
import { Button } from '../../../shared/ui/elements/Button';
import { Loader2, Search, UserX } from 'lucide-react';

const ITEMS_PER_PAGE = 20;
const SORT_OPTIONS = [
    { value: 'created_at:desc', label: 'Дата' },
    { value: 'created_at:asc', label: 'Дата' },
    { value: 'title:asc', label: 'Назва' },
    { value: 'title:desc', label: 'Назва' },
    { value: 'views:desc', label: 'Перегляди' },
    { value: 'views:asc', label: 'Перегляди' }
];

const CatalogPage = () => {
    const [sites, setSites] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [sortOption, setSortOption] = useState('created_at:desc');
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [searchParams] = useSearchParams();
    const [onlyFavorites, setOnlyFavorites] = useState(searchParams.get('favorites') === 'true');
    const [hideMySites, setHideMySites] = useState(false);
    const { user } = useContext(AuthContext);
    const { favoriteSiteIds, addFavorite, removeFavorite } = useContext(FavoritesContext);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        apiClient.get('/tags').then(res => setTags(res.data)).catch(console.error);
        fetchSites();
    }, []);

    const fetchSites = async () => {
        setLoading(true);
        try {
            const params = { search: searchTerm, sort: sortOption, tag: selectedTag, onlyFavorites };
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

    const handleToggleFavorite = async (siteId) => {
        if (!user) { toast.info("Увійдіть для додавання в обране"); return; }
        if (favoriteSiteIds.has(siteId)) {
            await removeFavorite(siteId);
            toast.info("Видалено з обраних");
        } else {
            await addFavorite(siteId);
            toast.success("Додано в обране");
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const filteredSites = sites.filter(s => hideMySites && user ? s.author !== user.username : true);
    const visibleSites = filteredSites.slice(0, visibleCount);
    const styles = {
        pageWrapper: {
            margin: '-2rem', 
            width: 'calc(100% + 4rem)', 
            minHeight: 'calc(100vh - 64px + 4rem)',
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: 'var(--platform-bg)', 
        },
        stickyContainer: {
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: 'var(--platform-bg)',
            borderBottom: '1px solid var(--platform-border-color)', 
        },
        header: {
            padding: '12px 24px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            borderBottom: '1px solid var(--platform-border-color)', 
            height: '60px', 
            flexShrink: 0,
            position: 'relative',
            backgroundColor: 'var(--platform-bg)'
        },
        gridArea: { 
            flex: 1, 
            padding: '24px', 
            position: 'relative' 
        },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.stickyContainer}>
                <div style={styles.header}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--platform-text-primary)' }}>Каталог Сайтiв</h1>
                        <span style={{ fontSize: '0.85rem', color: 'var(--platform-text-secondary)' }}>
                            Знайдено: {filteredSites.length}
                        </span>
                    </div>
                </div>

                <SiteFilters 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                    onSearchSubmit={() => fetchSites()}
                    sortOption={sortOption} 
                    onSortChange={setSortOption}
                    sortOptions={SORT_OPTIONS}
                    tags={tags} 
                    selectedTag={selectedTag} 
                    onTagSelect={setSelectedTag}
                    showStarFilter={true} 
                    isStarActive={onlyFavorites} 
                    onStarClick={() => setOnlyFavorites(!onlyFavorites)}
                    starTitle={onlyFavorites ? "Показати всі" : "Тільки обрані"}
                    extraButtons={user && (
                        <Button variant="toggle-danger" active={hideMySites} onClick={() => setHideMySites(!hideMySites)} title="Приховати мої" style={{ height: '38px', width: '38px' }}>
                            <UserX size={16} />
                        </Button>
                    )}
                />
            </div>

            <div style={styles.gridArea}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--platform-text-secondary)' }}><Loader2 size={32} className="animate-spin" /></div>
                ) : filteredSites.length === 0 ? (
                    <EmptyState 
                        title="Нічого не знайдено"
                        description="Спробуйте змінити умови пошуку"
                        icon={Search}
                        action={
                            (searchTerm || selectedTag || onlyFavorites) && (
                                <Button variant="ghost" onClick={() => { setSearchTerm(''); setSelectedTag(null); setOnlyFavorites(false); }}>
                                    Очистити фільтри
                                </Button>
                            )
                        }
                    />
                ) : (
                    <>
                        <div style={styles.grid}>
                            {visibleSites.map(site => (
                                <SiteGridCard 
                                    key={site.id} site={site} variant="public"
                                    onTagClick={setSelectedTag} formatDate={formatDate}
                                    isFavorite={favoriteSiteIds.has(site.id)}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ))}
                        </div>
                        {filteredSites.length > visibleCount && (
                            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                <Button variant="outline" onClick={() => setVisibleCount(p => p + ITEMS_PER_PAGE)}>
                                    Більше ({filteredSites.length - visibleCount})
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CatalogPage;