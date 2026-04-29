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
import LoadingState from '../../../shared/ui/complex/LoadingState';
import { Button } from '../../../shared/ui/elements/Button';
import { Search, UserX } from 'lucide-react';

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
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoading(false); 
        }
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
    return (
        <div className="-m-4 sm:-m-8 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] min-h-[calc(100vh-64px+4rem)] flex flex-col bg-(--platform-bg)">
            <div className="sticky top-0 z-50 bg-(--platform-bg) shadow-sm border-b border-(--platform-border-color)">
                <div className="p-4 sm:px-6 sm:py-3 flex flex-col sm:flex-row justify-center items-center border-b border-(--platform-border-color) bg-(--platform-bg) min-h-15">
                    <h1 className="text-lg sm:text-xl font-bold m-0 text-center text-(--platform-text-primary)">
                        Каталог Сайтів
                    </h1>
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
                        <button 
                            type="button"
                            onClick={() => setHideMySites(!hideMySites)} 
                            title={hideMySites ? "Показати мої сайти" : "Приховати мої сайти"} 
                            className={`h-10 w-10 flex items-center justify-center shrink-0 rounded-lg border transition-all cursor-pointer shadow-sm ${
                                hideMySites 
                                    ? 'border-red-500 text-red-500 bg-red-500/10' 
                                    : 'border-(--platform-border-color) bg-(--platform-card-bg) text-(--platform-text-secondary) hover:border-red-500 hover:text-red-500'
                            }`}
                        >
                            <UserX size={20} strokeWidth={2.5} />
                        </button>
                    )}
                />
            </div>
            <div className="flex-1 p-4 sm:p-6 relative bg-(--platform-bg)">
                {loading ? (
                    <LoadingState layout="page" /> 
                ) : filteredSites.length === 0 ? (
                    <EmptyState 
                        title="Нічого не знайдено"
                        description="Спробуйте змінити умови пошуку"
                        icon={Search}
                        action={
                            (searchTerm || selectedTag || onlyFavorites || hideMySites) && (
                                <Button variant="ghost" onClick={() => { setSearchTerm(''); setSelectedTag(null); setOnlyFavorites(false); setHideMySites(false); }}>
                                    Очистити фільтри
                                </Button>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 sm:gap-5 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
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
                            <div className="text-center mt-8 pb-6">
                                <Button variant="outline" onClick={() => setVisibleCount(p => p + ITEMS_PER_PAGE)} className="rounded-full px-6">
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