// frontend/src/modules/dashboard/pages/MySitesPage.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../app/providers/AuthContext';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import SiteFilters from '../../../shared/ui/complex/SiteFilters';
import SiteGridCard from '../../../shared/ui/complex/SiteGridCard';
import EmptyState from '../../../shared/ui/complex/EmptyState';
import { Button } from '../../../shared/ui/elements/Button';
import { Plus, Loader2, Search } from 'lucide-react';

const ITEMS_PER_PAGE = 20;
const SORT_OPTIONS = [
    { value: 'created_at:desc', label: 'Дата' },
    { value: 'created_at:asc', label: 'Дата' },
    { value: 'title:asc', label: 'Назва' },
    { value: 'title:desc', label: 'Назва' },
    { value: 'views:desc', label: 'Перегляди' },
    { value: 'views:asc', label: 'Перегляди' }
];

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

    const handleSearchSubmit = () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); fetchMySites(); };
    const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    const formatDate = (d) => new Date(d).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const handleDeleteSite = async (e, sitePath, siteTitle) => {
        if (await confirm({ title: "Видалення", message: `Видалити "${siteTitle}"?`, type: "danger" })) {
            try {
                await apiClient.delete(`/sites/${sitePath}`);
                setSites(prev => prev.filter(s => s.site_path !== sitePath));
                toast.success('Видалено!');
            } catch (err) { toast.error('Помилка'); }
        }
    };

    const handleStatusChange = async (site, requestedStatus) => {
        try {
            const newStatus = requestedStatus || (site.status === 'published' ? 'draft' : 'published');
            await apiClient.put(`/sites/${site.site_path}/settings`, { status: newStatus });
            setSites(prev => prev.map(s => s.id === site.id ? { ...s, status: newStatus } : s));
            if (newStatus === 'private') toast.success('Сайт приховано');
            else if (newStatus === 'published') toast.success('Сайт опубліковано');
            else toast.success('Сайт перенесено в чернетки');

        } catch (err) { 
            console.error(err);
            toast.error('Помилка при зміні статусу'); 
        }
    };

    const handleTogglePin = async (siteId) => {
        try {
            const res = await apiClient.patch(`/sites/${siteId}/pin`);
            setSites(prev => prev.map(s => s.id === siteId ? { ...s, is_pinned: res.data.is_pinned } : s));
        } catch (error) { toast.error('Помилка'); }
    };

    const filteredSites = sites.filter(s => onlyPinned ? s.is_pinned : true)
        .sort((a, b) => (a.is_pinned === b.is_pinned ? 0 : a.is_pinned ? -1 : 1));
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
        grid: { display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }
    };

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.stickyContainer}>
                <div style={styles.header}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Мої Сайти</h1>
                        <span style={{ fontSize: '0.85rem', color: 'var(--platform-text-secondary)' }}>
                            Всього: {sites.length}
                        </span>
                    </div>
                    
                    <Link to="/create-site" style={{ textDecoration: 'none', position: 'absolute', right: '24px' }}>
                        <Button variant="primary"><Plus size={18} /> Створити новий</Button>
                    </Link>
                </div>

                <SiteFilters 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                    onSearchSubmit={handleSearchSubmit}
                    sortOption={sortOption} 
                    onSortChange={setSortOption}
                    sortOptions={SORT_OPTIONS}
                    tags={tags} 
                    selectedTag={selectedTag} 
                    onTagSelect={setSelectedTag}
                    showStarFilter={true} 
                    isStarActive={onlyPinned} 
                    onStarClick={() => setOnlyPinned(!onlyPinned)}
                    starTitle="Тільки закріплені"
                />
            </div>

            <div style={styles.gridArea}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--platform-text-secondary)' }}>
                        <Loader2 size={32} className="animate-spin" style={{ marginBottom: '10px' }} />
                        <div>Завантаження...</div>
                    </div>
                ) : filteredSites.length === 0 ? (
                    <EmptyState 
                        title="Сайтів не знайдено"
                        description={sites.length === 0 ? "У вас ще немає створених сайтів" : "Спробуйте змінити параметри пошуку"}
                        icon={Search}
                        action={
                            (searchTerm || selectedTag || onlyPinned) ? (
                                <Button variant="ghost" onClick={() => { setSearchTerm(''); setSelectedTag(null); setOnlyPinned(false); }}>
                                    Очистити фільтри
                                </Button>
                            ) : (
                                <Link to="/create-site" style={{ textDecoration: 'none' }}>
                                    <Button variant="outline"><Plus size={16} /> Створити сайт</Button>
                                </Link>
                            )
                        }
                    />
                ) : (
                    <>
                        <div style={styles.grid}>
                            {visibleSites.map(site => (
                                <SiteGridCard 
                                    key={site.id} site={site} variant="owner"
                                    onTagClick={setSelectedTag} formatDate={formatDate}
                                    onDelete={handleDeleteSite} 
                                    onToggleStatus={handleStatusChange}
                                    onTogglePin={handleTogglePin}
                                />
                            ))}
                        </div>
                        {filteredSites.length > visibleCount && (
                            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                <Button variant="outline" onClick={handleLoadMore}>
                                    Показати ще ({filteredSites.length - visibleCount})
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MySitesPage;