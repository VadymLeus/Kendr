// frontend/src/modules/shop/CartPage.jsx
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { CartContext } from '../../app/providers/CartContext';
import { AuthContext } from '../../app/providers/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../shared/api/api';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../shared/config';
import { Input } from '../../shared/ui/elements/Input';
import { Button } from '../../shared/ui/elements/Button';
import EmptyState from '../../shared/ui/complex/EmptyState';
import ConfirmModal from '../../shared/ui/complex/ConfirmModal';
import LoadingState from '../../shared/ui/complex/LoadingState';
import { Trash2, Minus, Plus, Store, CreditCard, AlertCircle, PackageOpen, User, Mail, Phone, MapPin, Loader2, ShoppingBag, CheckCircle2, Download } from 'lucide-react';

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart, updateQuantity, isLoaded } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [customerData, setCustomerData] = useState({
        name: '', email: '', phone: '', address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [activeSiteId, setActiveSiteId] = useState(null);
    const [resolvedPaths, setResolvedPaths] = useState({});
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        actionType: null,
        targetId: null,
        title: '',
        message: ''
    });
    useEffect(() => {
        if (user) {
            setCustomerData(prev => ({
                ...prev,
                name: prev.name || user.username || '',
                email: user.email || ''
            }));
        }
    }, [user]);
    useEffect(() => {
        const fetchPaths = async () => {
            const missingIds = cartItems
                .map(item => item.site_id)
                .filter(id => id && !resolvedPaths[id]);
            const uniqueMissingIds = [...new Set(missingIds)];
            if (uniqueMissingIds.length === 0) return;
            const newPaths = { ...resolvedPaths };
            for (const id of uniqueMissingIds) {
                const itemWithPath = cartItems.find(i => i.site_id === id && i.site_path);
                if (itemWithPath) {
                    newPaths[id] = itemWithPath.site_path;
                    continue;
                }
                try {
                    const res = await apiClient.get(`/site/info/${id}`);
                    if (res.data && res.data.site_path) {
                        newPaths[id] = res.data.site_path;
                    }
                } catch (e) {
                    console.error("Помилка завантаження site_path для id:", id);
                }
            }
            setResolvedPaths(newPaths);
        };
        fetchPaths();
    }, [cartItems]);

    const groupedItems = useMemo(() => {
        const groups = {};
        cartItems.forEach(item => {
            const siteId = item.site_id || 'unknown';
            const sitePath = item.site_path || resolvedPaths[siteId] || siteId; 
            if (!groups[siteId]) {
                groups[siteId] = {
                    siteName: item.site_name || `Магазин #${siteId}`,
                    siteId: siteId,
                    sitePath: sitePath,
                    items: [],
                    total: 0,
                    totalOriginal: 0,
                    isDigitalOnly: true
                };
            }
            groups[siteId].items.push(item);
            const quantity = item.quantity;
            const price = parseFloat(item.price);
            const origPrice = item.originalPrice ? parseFloat(item.originalPrice) : price;
            groups[siteId].total += price * quantity;
            groups[siteId].totalOriginal += origPrice * quantity;
            if (item.type !== 'digital') {
                groups[siteId].isDigitalOnly = false;
            }
        });
        return Object.values(groups).map(group => ({
            ...group,
            totalDiscount: group.totalOriginal - group.total
        }));
    }, [cartItems, resolvedPaths]);

    useEffect(() => {
        if (groupedItems.length > 0) {
            const isCurrentValid = groupedItems.some(g => g.siteId === activeSiteId);
            if (!isCurrentValid) {
                setActiveSiteId(groupedItems[0].siteId);
            }
        } else {
            setActiveSiteId(null);
        }
    }, [groupedItems, activeSiteId]);

    const activeGroup = useMemo(() => {
        return groupedItems.find(g => g.siteId === activeSiteId) || null;
    }, [groupedItems, activeSiteId]);

    const clearCartForSite = (siteId) => {
        const itemsToRemove = cartItems.filter(item => item.site_id === siteId);
        itemsToRemove.forEach(item => removeFromCart(item.cartItemId));
    };

    const promptRemoveItem = (item) => {
        setConfirmModal({
            isOpen: true,
            actionType: 'remove',
            targetId: item.cartItemId,
            title: 'Видалити товар',
            message: `Ви впевнені, що хочете видалити "${item.name}" з кошика?`
        });
    };

    const promptClearCart = () => {
        setConfirmModal({
            isOpen: true,
            actionType: 'clear',
            targetId: null,
            title: 'Очистити кошик',
            message: 'Ви впевнені, що хочете повністю очистити кошик? Цю дію неможливо скасувати.'
        });
    };

    const handleConfirmAction = () => {
        if (confirmModal.actionType === 'remove' && confirmModal.targetId) {
            removeFromCart(confirmModal.targetId);
        } else if (confirmModal.actionType === 'clear') {
            clearCart();
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!activeGroup) return;
        if (!customerData.name.trim() || !customerData.email.trim() || !customerData.phone.trim()) {
            return toast.error('Будь ласка, заповніть всі обов\'язкові поля');
        }
        if (!activeGroup.isDigitalOnly && !customerData.address.trim()) {
            return toast.error('Адреса доставки обов\'язкова для фізичних товарів');
        }
        const outOfStockItem = activeGroup.items.find(item => item.type !== 'digital' && item.stock_quantity != null && item.quantity > item.stock_quantity);
        if (outOfStockItem) {
            return toast.error(`Товару "${outOfStockItem.name}" недостатньо на складі.`);
        }
        setIsSubmitting(true);
        try {
            const formattedItems = activeGroup.items.map(item => ({
                id: item.id,
                quantity: item.quantity,
                options: item.selectedOptions
            }));
            const payload = {
                siteId: activeGroup.siteId,
                items: formattedItems,
                customerData
            };
            const response = await apiClient.post('/orders/checkout', payload);
            if (response.data && response.data.data && response.data.signature) {
                setIsRedirecting(true);
                const { data, signature, orderId } = response.data;
                toast.success(`Перенаправлення на оплату замовлення #${orderId || ''}`);
                clearCartForSite(activeGroup.siteId);
                const form = document.createElement("form");
                form.method = "POST";
                form.action = "https://www.liqpay.ua/api/3/checkout";
                const dataInput = document.createElement("input");
                dataInput.type = "hidden";
                dataInput.name = "data";
                dataInput.value = data;
                const signatureInput = document.createElement("input");
                signatureInput.type = "hidden";
                signatureInput.name = "signature";
                signatureInput.value = signature;
                form.appendChild(dataInput);
                form.appendChild(signatureInput);
                document.body.appendChild(form);
                form.submit();
            } else {
                toast.success(`Замовлення #${response.data.orderId || ''} оформлено!`);
                clearCartForSite(activeGroup.siteId);
                navigate('/my-orders');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка оформлення замовлення');
            setIsSubmitting(false);
        }
    };

    const getImageUrl = (item) => {
        let gallery = item.image_gallery || item.image_path || item.image;
        let targetPath = null;
        if (Array.isArray(gallery) && gallery.length > 0) targetPath = gallery[0];
        else if (typeof gallery === 'string') {
            try {
                if (gallery.startsWith('[')) targetPath = JSON.parse(gallery)[0];
                else targetPath = gallery;
            } catch (e) { targetPath = gallery; }
        }
        if (!targetPath) return 'https://placehold.co/120x120?text=No+Image';
        if (targetPath.startsWith('http')) return targetPath;
        return `${BASE_URL}${targetPath.startsWith('/') ? targetPath : `/${targetPath}`}`;
    };
    if (!isLoaded || isRedirecting) {
        return <LoadingState layout="page" />;
    }
    return (
        <>
            <div className="p-4 md:p-8 max-w-5xl mx-auto w-full h-full flex flex-col">
                <div className="shrink-0 mb-6">
                    <h1 className="text-2xl font-bold text-(--platform-text-primary) flex items-center gap-3">
                        <ShoppingBag className="text-(--platform-accent)" /> Кошик
                    </h1>
                    {cartItems.length > 0 && (
                        <p className="text-(--platform-text-secondary) mt-1 text-sm">
                            {groupedItems.length > 1 
                                ? "Виберіть магазин ліворуч для оформлення відповідного замовлення." 
                                : "Оформлення ваших замовлень"}
                        </p>
                    )}
                </div>
                {cartItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                        <EmptyState 
                            icon={PackageOpen}
                            title="Ваш кошик порожній"
                            description="Знайдіть товари в каталозі та додайте їх сюди."
                        />
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-8 space-y-6">
                            {groupedItems.map((group) => {
                                const isActive = activeSiteId === group.siteId;
                                return (
                                    <div 
                                        key={group.siteId} 
                                        onClick={() => setActiveSiteId(group.siteId)}
                                        className={`bg-(--platform-card-bg) border rounded-xl overflow-hidden shadow-sm cursor-pointer transition-all duration-300 relative ${
                                            isActive 
                                                ? 'border-(--platform-accent) ring-1 ring-(--platform-accent)' 
                                                : 'border-(--platform-border-color) hover:border-(--platform-accent)/50 hover:bg-(--platform-hover-bg)'
                                        }`}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-(--platform-accent) z-10" />
                                        )}
                                        <div className="px-6 py-4 border-b border-(--platform-border-color) flex items-center justify-between bg-black/5">
                                            <div className="flex items-center gap-3">
                                                <Store size={20} className={isActive ? 'text-(--platform-accent)' : 'text-(--platform-text-secondary)'} />
                                                <Link 
                                                    to={`/site/${group.sitePath}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`text-base font-bold uppercase tracking-wider hover:underline ${isActive ? 'text-(--platform-accent)' : 'text-(--platform-text-primary)'}`}
                                                    title="Перейти на сайт магазину"
                                                >
                                                    {group.siteName}
                                                </Link>
                                            </div>
                                            {isActive && (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-(--platform-accent) bg-(--platform-accent)/10 px-3 py-1 rounded-full">
                                                    <CheckCircle2 size={14} /> Вибрано для оплати
                                                </div>
                                            )}
                                        </div>
                                        <div className="divide-y divide-(--platform-border-color)">
                                            {group.items.map((item) => (
                                                <div key={item.cartItemId} className="p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start transition-colors">
                                                    <div className="w-24 h-24 bg-(--platform-bg) rounded-lg border border-(--platform-border-color) overflow-hidden shrink-0 flex items-center justify-center">
                                                        <img src={getImageUrl(item)} alt={item.name} className="w-full h-full object-contain p-2" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 w-full">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Link 
                                                                to={`/site/${group.sitePath}/product/${item.id}`} 
                                                                onClick={(e) => e.stopPropagation()} 
                                                                className="text-lg font-bold text-(--platform-text-primary) hover:text-(--platform-accent) transition-colors"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                            {item.type === 'digital' && (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-(--platform-bg)/90 backdrop-blur-md rounded-lg text-[0.7rem] uppercase tracking-wider font-bold shadow-sm border border-(--platform-border-color) text-(--platform-accent) align-middle">
                                                                    <Download size={12}/> Цифровий
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {item.type !== 'digital' && item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                                                                <span key={k} className="text-xs px-2 py-1 rounded bg-(--platform-bg) border border-(--platform-border-color) text-(--platform-text-secondary)">
                                                                    {k}: <span className="font-semibold text-(--platform-text-primary)">{v}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 flex items-center">
                                                            <div className="flex items-center bg-(--platform-bg) border border-(--platform-border-color) rounded-lg p-1" onClick={e => e.stopPropagation()}>
                                                                <button 
                                                                    className="p-1.5 text-(--platform-text-secondary) hover:text-(--platform-accent) disabled:opacity-30"
                                                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.cartItemId, item.quantity - 1); }}
                                                                    disabled={item.quantity <= 1}
                                                                    type="button"
                                                                >
                                                                    <Minus size={16} />
                                                                </button>
                                                                <span className="w-10 text-center font-bold text-(--platform-text-primary)">{item.quantity}</span>
                                                                <button 
                                                                    className="p-1.5 text-(--platform-text-secondary) hover:text-(--platform-accent) disabled:opacity-30"
                                                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.cartItemId, item.quantity + 1); }}
                                                                    disabled={item.type !== 'digital' && item.stock_quantity != null && item.quantity >= item.stock_quantity}
                                                                    type="button"
                                                                    title={item.type !== 'digital' && item.stock_quantity != null && item.quantity >= item.stock_quantity ? "Досягнуто ліміту на складі" : ""}
                                                                >
                                                                    <Plus size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 min-w-28 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 sm:pl-4 border-(--platform-border-color) flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2 h-full">
                                                        <div className="text-left sm:text-right">
                                                            {item.originalPrice && parseFloat(item.originalPrice) > parseFloat(item.price) && (
                                                                <p className="text-xs text-(--platform-text-secondary) line-through m-0">
                                                                    {(item.originalPrice * item.quantity).toFixed(0)} ₴
                                                                </p>
                                                            )}
                                                            <p className="text-xl font-bold text-(--platform-text-primary) m-0">
                                                                {(item.price * item.quantity).toFixed(0)} ₴
                                                            </p>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); promptRemoveItem(item); }}
                                                            className="p-2 text-(--platform-text-secondary) hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors z-10 relative sm:mt-auto"
                                                            title="Видалити"
                                                            type="button"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="pt-4 flex justify-end">
                                <Button variant="ghost" onClick={promptClearCart} className="text-red-500 hover:bg-red-500/10">
                                    Очистити весь кошик
                                </Button>
                            </div>
                        </div>
                        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                            {activeGroup ? (
                                <form onSubmit={handleCheckout} className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl p-6 shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-(--platform-accent)" />
                                    <h3 className="text-lg font-bold mb-1 text-(--platform-text-primary)">
                                        Оформлення замовлення
                                    </h3>
                                    <p className="text-sm text-(--platform-text-secondary) mb-6 pb-4 border-b border-(--platform-border-color)">
                                        Для магазину: <span className="font-semibold text-(--platform-text-primary)">{activeGroup.siteName}</span>
                                    </p>
                                    <div className="space-y-4 mb-6">
                                        <Input 
                                            label="ПІБ отримувача"
                                            leftIcon={<User size={18}/>}
                                            placeholder="Прізвище та ім'я"
                                            value={customerData.name}
                                            onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                                            required
                                        />
                                        <Input 
                                            label="Email"
                                            leftIcon={<Mail size={18}/>}
                                            type="email"
                                            value={customerData.email}
                                            disabled={true} 
                                            helperText={activeGroup.isDigitalOnly ? "Сюди ми надішлемо доступ" : "Для отримання чеку"}
                                        />
                                        <Input 
                                            label="Телефон"
                                            leftIcon={<Phone size={18}/>}
                                            type="tel"
                                            placeholder="+380..."
                                            value={customerData.phone}
                                            onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                                            required
                                        />
                                        {!activeGroup.isDigitalOnly && (
                                            <Input 
                                                label="Адреса доставки"
                                                leftIcon={<MapPin size={18}/>}
                                                placeholder="Місто, номер відділення НП"
                                                value={customerData.address}
                                                onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                                                required
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-(--platform-border-color)">
                                        <div className="flex justify-between text-sm text-(--platform-text-secondary)">
                                            <span>Товари ({activeGroup.items.length}):</span>
                                            <span>{activeGroup.totalOriginal.toFixed(0)} ₴</span>
                                        </div>
                                        {activeGroup.totalDiscount > 0 && (
                                            <div className="flex justify-between text-sm text-green-500 font-medium">
                                                <span>Знижка:</span>
                                                <span>-{activeGroup.totalDiscount.toFixed(0)} ₴</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-2xl font-bold text-(--platform-text-primary) pt-2">
                                            <span>До сплати:</span>
                                            <span>{activeGroup.total.toFixed(0)} ₴</span>
                                        </div>
                                    </div>
                                    <div className={`mt-5 p-3 rounded-lg flex gap-3 text-xs leading-relaxed ${activeGroup.isDigitalOnly ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                        <AlertCircle className="shrink-0 mt-0.5" size={16} />
                                        <span>
                                            {activeGroup.isDigitalOnly 
                                                ? "Доставка не потрібна. Товар цифровий." 
                                                : "Доставка здійснюється поштою. Оплата доставки при отриманні."}
                                        </span>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        className="w-full mt-6 h-14 text-lg font-bold bg-orange-600 hover:bg-orange-700 text-white border-none shadow-md transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="animate-spin mr-2" /> Обробка...</>
                                        ) : (
                                            <><CreditCard className="mr-2" /> Оплатити {activeGroup.total.toFixed(0)} ₴</>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl p-8 text-center shadow-sm">
                                    <Store size={48} className="mx-auto text-(--platform-text-secondary) opacity-30 mb-4" />
                                    <h3 className="text-lg font-bold text-(--platform-text-primary) mb-2">
                                        Виберіть магазин
                                    </h3>
                                    <p className="text-(--platform-text-secondary) text-sm">
                                        Клацніть на блок з товарами ліворуч, щоб розпочати оформлення замовлення
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel="Видалити"
                cancelLabel="Скасувати"
                type="danger"
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </>
    );
};

export default CartPage;