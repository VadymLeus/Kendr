// frontend/src/modules/dashboard/features/commerce/components/ReviewsTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../../../shared/api/api';
import { BASE_URL } from '../../../../../shared/config';
import { useConfirm } from '../../../../../shared/hooks/useConfirm';
import { toast } from 'react-toastify';
import { Input } from '../../../../../shared/ui/elements/Input';
import CustomSelect from '../../../../../shared/ui/elements/CustomSelect';
import LoadingState from '../../../../../shared/ui/complex/LoadingState';
import { Star, MessageSquare, Trash, Grid, Search, Clock, User, ExternalLink, Filter } from 'lucide-react';

const DangerButton = ({ onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className="px-3 py-1.5 border border-[#EF4444] text-[#EF4444] rounded-md cursor-pointer text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-[#EF4444] hover:text-white bg-transparent shrink-0"
        >
            {children}
        </button>
    );
};

const ReviewsTab = ({ siteData }) => {
    const [productsWithReviews, setProductsWithReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [filters, setFilters] = useState({ search: '', category: 'all', rating: 'all' });
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewFilter, setReviewFilter] = useState('all');
    const [replyText, setReplyText] = useState({});
    const [submittingReply, setSubmittingReply] = useState(null);
    const { confirm } = useConfirm();
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingProducts(true);
                const [pRes, cRes] = await Promise.all([
                    apiClient.get(`/products/site/${siteData.id}`),
                    apiClient.get(`/categories/site/${siteData.id}`)
                ]);
                const filteredProducts = (pRes.data || [])
                    .filter(p => p.review_count > 0)
                    .map(p => ({
                        ...p,
                        category_ids: Array.isArray(p.categories) ? p.categories.map(c => c.id.toString()) : []
                    }));
                setProductsWithReviews(filteredProducts);
                setCategories(cRes.data || []);
            } catch (err) {
                toast.error('Помилка завантаження даних');
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchData();
    }, [siteData.id]);
    useEffect(() => {
        const idFromUrl = searchParams.get('productId');
        if (idFromUrl && productsWithReviews.length > 0 && (!selectedProduct || selectedProduct.id.toString() !== idFromUrl)) {
            const target = productsWithReviews.find(p => p.id.toString() === idFromUrl);
            if (target) {
                setSelectedProduct(target);
                setReviewFilter('all');
            }
        }
    }, [productsWithReviews, searchParams]);

    useEffect(() => {
        if (!selectedProduct) return;
        const fetchReviews = async () => {
            try {
                setLoadingReviews(true);
                const res = await apiClient.get(`/products/${selectedProduct.id}/reviews`);
                setReviews(res.data);
            } catch (err) {
                toast.error('Помилка завантаження відгуків');
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [selectedProduct]);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setReviewFilter('all');
        setSearchParams(prev => { prev.set('productId', product.id); return prev; });
    };

    const handleReply = async (reviewId) => {
        const text = replyText[reviewId];
        if (!text || !text.trim()) return;
        try {
            setSubmittingReply(reviewId);
            await apiClient.put(`/products/${selectedProduct.id}/reviews/${reviewId}/reply`, { owner_reply: text });
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, owner_reply: text } : r));
            setReplyText(prev => ({ ...prev, [reviewId]: '' }));
            toast.success('Відповідь збережено');
        } catch (err) {
            toast.error('Помилка збереження відповіді: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmittingReply(null);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!await confirm({ title: "Видалити відгук?", message: "Цю дію неможливо скасувати.", type: "danger", confirmLabel: "Видалити" })) return;
        try {
            await apiClient.delete(`/products/${selectedProduct.id}/reviews/${reviewId}`);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            setProductsWithReviews(prev => prev.map(p => {
                if (p.id === selectedProduct.id) {
                    return { ...p, review_count: p.review_count - 1 };
                }
                return p;
            }).filter(p => p.review_count > 0)); 
            toast.success('Відгук видалено');
            if (reviews.length <= 1) {
                setSelectedProduct(null);
                setSearchParams(prev => { prev.delete('productId'); return prev; });
            }
        } catch (err) {
            toast.error('Помилка видалення: ' + (err.response?.data?.message || err.message));
        }
    };

    const categoryOptions = [
        { value: 'all', label: 'Всі категорії' },
        ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
    ];

    const ratingOptions = [
        { value: 'all', label: 'Всі оцінки' },
        { value: 'good', label: 'Відмінно (4-5 ★)' },
        { value: 'neutral', label: 'Задовільно (3 ★)' },
        { value: 'bad', label: 'Погано (1-2 ★)' }
    ];

    const reviewRatingOptions = [
        { value: 'all', label: 'Всі відгуки' },
        { value: '5', label: '5 зірок' },
        { value: '4', label: '4 зірки' },
        { value: '3', label: '3 зірки' },
        { value: '2', label: '2 зірки' },
        { value: '1', label: '1 зірка' }
    ];

    const filteredProducts = useMemo(() => {
        return productsWithReviews.filter(p => {
            const sLower = filters.search.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(sLower);
            const matchesCategory = filters.category === 'all' || 
                (p.category_ids && p.category_ids.includes(filters.category));
                
            let matchesRating = true;
            const avg = Number(p.average_rating || 0);
            if (filters.rating === 'good') matchesRating = avg >= 3.5;
            if (filters.rating === 'neutral') matchesRating = avg >= 2.5 && avg < 3.5;
            if (filters.rating === 'bad') matchesRating = avg < 2.5;

            return matchesSearch && matchesCategory && matchesRating;
        });
    }, [productsWithReviews, filters]);
    const filteredReviews = useMemo(() => {
        return reviews.filter(r => reviewFilter === 'all' || r.rating.toString() === reviewFilter);
    }, [reviews, reviewFilter]);
    if (loadingProducts) return <LoadingState title="Завантаження товарів..." />;
    return (
        <div className="w-full h-full flex flex-col box-border px-1">
            <div className="bg-(--platform-card-bg) rounded-xl border border-(--platform-border-color) shadow-sm h-full flex overflow-hidden">
                <div className="w-[40%] min-w-[320px] max-w-125 border-r border-(--platform-border-color) flex flex-col bg-(--platform-card-bg) shrink-0">
                    <div className="p-3 lg:px-4 border-b border-[#2d3748] bg-[#1a202c] flex flex-col gap-2 shrink-0">
                        <Input 
                            placeholder="Пошук товарів..." 
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                            leftIcon={<Search size={14} style={{color: '#a0aec0'}}/>}
                            className="review-search-input"
                            wrapperStyle={{margin: 0}}
                        />
                        <div className="flex gap-2">
                            <div className="flex-1 min-w-0">
                                <CustomSelect 
                                    value={filters.category}
                                    onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
                                    options={categoryOptions}
                                    style={{ height: '36px', background: '#2d3748', color: '#fff', border: '1px solid #4a5568', fontSize: '0.8rem' }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CustomSelect 
                                    value={filters.rating}
                                    onChange={(e) => setFilters(prev => ({...prev, rating: e.target.value}))}
                                    options={ratingOptions}
                                    style={{ height: '36px', background: '#2d3748', color: '#fff', border: '1px solid #4a5568', fontSize: '0.8rem' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2.5 bg-(--platform-card-bg) custom-scrollbar">
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-40 p-5 text-center text-(--platform-text-secondary)">
                                <div className="w-14 h-14 rounded-full bg-(--platform-bg) flex items-center justify-center mb-4 border border-(--platform-border-color) shadow-sm">
                                    <Filter size={24} className="text-(--platform-accent) opacity-90" />
                                </div>
                                <h3 className="text-[0.95rem] font-semibold text-(--platform-text-primary) mb-1.5">
                                    Нічого не знайдено
                                </h3>
                                <p className="text-[0.8rem] max-w-50 leading-relaxed m-0 opacity-80">
                                    Змініть критерії пошуку або фільтри.
                                </p>
                            </div>
                        ) : (
                            filteredProducts.map(product => {
                                const isSelected = selectedProduct?.id === product.id;
                                return (
                                    <div 
                                        key={product.id} 
                                        onClick={() => handleSelectProduct(product)}
                                        className={`
                                            p-3 rounded-lg mb-2 cursor-pointer transition-all duration-150 relative border shadow-sm group flex items-center gap-3
                                            ${isSelected 
                                                ? 'border-(--platform-accent) bg-(--platform-hover-bg) ring-1 ring-(--platform-accent)' 
                                                : 'border-(--platform-border-color) bg-(--platform-bg) hover:border-(--platform-accent) hover:bg-(--platform-hover-bg)'
                                            }
                                        `}
                                    >
                                        <div className="w-12 h-12 rounded bg-(--platform-card-bg) border border-(--platform-border-color) overflow-hidden shrink-0 flex items-center justify-center relative">
                                            {product.image_gallery && product.image_gallery.length > 0 ? (
                                                <img 
                                                    src={product.image_gallery[0].startsWith('http') ? product.image_gallery[0] : `${BASE_URL}${product.image_gallery[0]}`} 
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Grid size={20} className="text-(--platform-text-secondary) opacity-50" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="font-semibold text-sm text-(--platform-text-primary) truncate mb-1">
                                                <span className="font-normal text-(--platform-text-secondary) mr-1">Товар:</span>
                                                {product.name}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-(--platform-accent) text-xs font-bold">
                                                    <Star size={12} fill="currentColor" /> {Number(product.average_rating).toFixed(1)}
                                                </div>
                                                <span className="text-[0.7rem] text-(--platform-text-secondary) truncate flex items-center gap-1">
                                                    • {product.review_count} відгук(ів)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden bg-[#1a202c] min-w-0">
                    {selectedProduct ? (
                        <>
                            <div className="px-4 lg:px-6 border-b border-[#2d3748] flex justify-between items-center bg-[#1a202c] min-h-17.5 shrink-0 text-white gap-4">
                                <div className="flex-1 min-w-0">
                                    <h2 className="m-0 mb-1 text-lg lg:text-xl text-white truncate">
                                        <span className="text-[#a0aec0] font-medium mr-1.5">Товар:</span>
                                        {selectedProduct.name}
                                    </h2>
                                    <div className="flex items-center gap-2.5 text-[#a0aec0] text-xs truncate">
                                        <span className="flex items-center gap-1 shrink-0">
                                            <Star size={12} fill="currentColor" className="text-(--platform-accent)"/> 
                                            {Number(selectedProduct.average_rating).toFixed(1)}
                                        </span>
                                        <span className="shrink-0">•</span>
                                        <span className="shrink-0">Всього відгуків: {selectedProduct.review_count}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="w-32 hidden sm:block">
                                        <CustomSelect 
                                            value={reviewFilter}
                                            onChange={(e) => setReviewFilter(e.target.value)}
                                            options={reviewRatingOptions}
                                            style={{ height: '32px', background: '#2d3748', color: '#fff', border: '1px solid #4a5568', fontSize: '0.8rem' }}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => window.open(`/site/${siteData.site_path}/product/${selectedProduct.id}`, '_blank')}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#4a5568] hover:border-(--platform-accent) text-[#a0aec0] hover:text-(--platform-accent) transition-colors text-sm font-medium bg-transparent cursor-pointer"
                                        title="Відкрити сторінку товару"
                                    >
                                        <span className="hidden lg:inline">На сторінку товару</span>
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="custom-scrollbar p-4 lg:p-6 overflow-y-auto flex-1 bg-(--platform-card-bg)">
                                {loadingReviews ? (
                                    <div className="h-full flex items-center justify-center">
                                        <LoadingState title="Завантаження відгуків..." />
                                    </div>
                                ) : filteredReviews.length === 0 ? (
                                    <div className="text-center p-8 text-(--platform-text-secondary) border border-dashed border-(--platform-border-color) rounded-lg">
                                        {reviewFilter !== 'all' ? 'Відгуків з такою оцінкою не знайдено.' : 'Відгуків для цього товару не знайдено.'}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {filteredReviews.map(review => (
                                            <div key={review.id} className="bg-(--platform-bg) border border-(--platform-border-color) rounded-lg p-5 shadow-sm">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <img 
                                                            src={review.avatar_url ? (review.avatar_url.startsWith('http') ? review.avatar_url : `${BASE_URL}${review.avatar_url}`) : `https://ui-avatars.com/api/?name=${review.username}&background=random`} 
                                                            alt={review.username} 
                                                            className="w-10 h-10 rounded-full object-cover border border-(--platform-border-color)"
                                                        />
                                                        <div>
                                                            <div className="font-semibold text-(--platform-text-primary) text-sm">{review.username}</div>
                                                            <div className="text-xs text-(--platform-text-secondary) mt-0.5 flex items-center gap-1">
                                                                <Clock size={10} /> {new Date(review.created_at).toLocaleString('uk-UA')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <Star 
                                                                    key={star} 
                                                                    size={14} 
                                                                    fill={star <= review.rating ? "var(--platform-accent)" : "transparent"} 
                                                                    color={star <= review.rating ? "var(--platform-accent)" : "var(--platform-border-color)"} 
                                                                />
                                                            ))}
                                                        </div>
                                                        <DangerButton onClick={() => handleDelete(review.id)}>
                                                            <Trash size={14} /> <span className="hidden sm:inline">Видалити</span>
                                                        </DangerButton>
                                                    </div>
                                                </div>
                                                <div className="text-(--platform-text-primary) mb-4 whitespace-pre-wrap text-sm leading-relaxed bg-(--platform-card-bg) p-3 rounded border border-(--platform-border-color)">
                                                    {review.comment}
                                                </div>
                                                {review.owner_reply ? (
                                                    <div className="bg-(--platform-card-bg) border-l-4 border-(--platform-accent) rounded-r-lg p-3 mt-4 shadow-sm">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <span className="font-bold text-(--platform-text-secondary) text-[0.7rem] uppercase tracking-wider flex items-center gap-1.5">
                                                                <User size={12}/> Ваша відповідь
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-(--platform-text-primary) m-0">{review.owner_reply}</p>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 flex gap-2">
                                                        <Input 
                                                            placeholder="Написати відповідь як магазин..."
                                                            value={replyText[review.id] || ''}
                                                            onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleReply(review.id); }}
                                                            wrapperStyle={{margin: 0, flex: 1}}
                                                        />
                                                        <button 
                                                            onClick={() => handleReply(review.id)}
                                                            disabled={submittingReply === review.id || !replyText[review.id]?.trim()}
                                                            className="bg-(--platform-accent) text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-10"
                                                        >
                                                            {submittingReply === review.id ? 'Збереження...' : 'Відповісти'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-[#a0aec0] p-4 text-center">
                            <div className="mb-4 opacity-10">
                                <MessageSquare size={64} strokeWidth={1.5} />
                            </div>
                            <div className="text-lg">Оберіть товар зі списку ліворуч</div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .review-search-input .input-wrapper {
                    background-color: #2d3748 !important;
                    border: 1px solid #4a5568 !important;
                    height: 36px !important;
                }
                .review-search-input input {
                    color: #ffffff !important;
                    font-size: 0.85rem !important;
                }
            `}</style>
        </div>
    );
};

export default ReviewsTab;