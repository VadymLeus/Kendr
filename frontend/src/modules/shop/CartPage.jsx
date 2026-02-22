// frontend/src/modules/shop/pages/CartPage.jsx
import React, { useContext, useMemo, useState } from 'react';
import { CartContext } from '../../app/providers/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../shared/api/api';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../shared/config';
import { Input } from '../../shared/ui/elements/Input';
import { Trash2, Minus, Plus, Store, ArrowLeft, CreditCard, Tag, AlertCircle, PackageOpen, User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

const CartPage = () => {
    const { cartItems, isDigitalOnly, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
    const navigate = useNavigate();
    const [customerData, setCustomerData] = useState({
        name: '', email: '', phone: '', address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const groupedItems = useMemo(() => {
        const groups = {};
        cartItems.forEach(item => {
            const siteId = item.site_id || 'unknown';
            if (!groups[siteId]) {
                groups[siteId] = {
                    siteName: item.site_name || `Магазин #${siteId}`,
                    siteId: siteId,
                    items: []
                };
            }
            groups[siteId].items.push(item);
        });
        return Object.values(groups);
    }, [cartItems]);

    const { total, totalOriginal, totalDiscount } = useMemo(() => {
        let currentSum = 0;
        let originalSum = 0;
        cartItems.forEach(item => {
            const quantity = item.quantity;
            const price = parseFloat(item.price);
            const origPrice = item.originalPrice ? parseFloat(item.originalPrice) : price;
            currentSum += price * quantity;
            originalSum += origPrice * quantity;
        });
        return { total: currentSum, totalOriginal: originalSum, totalDiscount: originalSum - currentSum };
    }, [cartItems]);

    const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!customerData.name.trim() || !customerData.email.trim() || !customerData.phone.trim()) {
            return toast.error('Будь ласка, заповніть всі обов\'язкові поля');
        }
        if (!isDigitalOnly && !customerData.address.trim()) {
            return toast.error('Адреса доставки обов\'язкова для фізичних товарів');
        }
        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/orders/checkout', { cartItems, customerData });
            if (response.data && response.data.data && response.data.signature) {
                const { data, signature } = response.data;
                clearCart();
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
                toast.success('Замовлення оформлено!');
                clearCart();
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Помилка оформлення замовлення');
            setIsSubmitting(false);
        }
    };

    const getImageUrl = (item) => {
        let gallery = item.image_gallery || item.image_path || item.image;
        let targetPath = null;
        if (Array.isArray(gallery) && gallery.length > 0) {
            targetPath = gallery[0];
        } 
        else if (typeof gallery === 'string') {
            try {
                if (gallery.startsWith('[')) { targetPath = JSON.parse(gallery)[0]; } 
                else { targetPath = gallery; }
            } catch (e) { targetPath = gallery; }
        }
        if (!targetPath) return 'https://placehold.co/120x120?text=No+Image';
        if (targetPath.startsWith('http')) return targetPath;
        const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
        return `${BASE_URL}${cleanPath}`;
    };

    const cssStyles = `
        .cart-grid { display: grid; grid-template-columns: 1fr 400px; gap: 30px; align-items: start; width: 100%; }
        .hover-btn { transition: all 0.2s ease-in-out; }
        .qty-btn:hover:not(:disabled) { background-color: var(--platform-hover-bg) !important; color: var(--platform-accent) !important; border-color: var(--platform-accent) !important; }
        .remove-btn:hover { background-color: color-mix(in srgb, var(--platform-danger), transparent 90%) !important; color: var(--platform-danger) !important; transform: scale(1.1); }
        .checkout-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .checkout-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .clear-btn:hover { background-color: var(--platform-hover-bg) !important; color: var(--platform-text-primary) !important; border-color: var(--platform-text-primary) !important; }
        .product-link:hover { color: var(--platform-accent) !important; text-decoration: underline; }
        @media (max-width: 1100px) { .cart-grid { grid-template-columns: 1fr; } .summary-card { position: static !important; margin-top: 20px; } }
    `;

    const styles = {
        pageContainer: { width: '95%', maxWidth: '1920px', margin: '0 auto', padding: '40px 10px', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', color: 'var(--platform-text-primary)' },
        header: { marginBottom: '30px', paddingLeft: '10px' },
        title: { fontSize: '2.2rem', fontWeight: '700', color: 'var(--platform-text-primary)', marginBottom: '5px' },
        subtitle: { color: 'var(--platform-text-secondary)', fontSize: '1.1rem' },
        tableContainer: { background: 'var(--platform-card-bg)', border: '1px solid var(--platform-border-color)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
        storeHeader: { background: 'var(--platform-bg)', padding: '25px 30px', borderBottom: '1px solid var(--platform-border-color)', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '800', color: 'var(--platform-text-primary)', fontSize: '1.5rem', textTransform: 'uppercase' },
        itemRow: { display: 'flex', padding: '30px', borderBottom: '1px solid var(--platform-border-color)', gap: '30px', alignItems: 'center', background: 'var(--platform-card-bg)' },
        imageWrapper: { width: '120px', height: '120px', borderRadius: '12px', border: '1px solid var(--platform-border-color)', overflow: 'hidden', flexShrink: 0, background: 'var(--platform-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
        image: { width: '100%', height: '100%', objectFit: 'contain', padding: '5px' },
        infoCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
        productName: { fontSize: '1.3rem', fontWeight: '600', color: 'var(--platform-text-primary)', textDecoration: 'none' },
        metaInfo: { display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.95rem', color: 'var(--platform-text-secondary)' },
        priceCol: { textAlign: 'right', minWidth: '140px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' },
        price: { fontSize: '1.4rem', fontWeight: '700', color: 'var(--platform-text-primary)', display: 'block' },
        salePrice: { fontSize: '1.4rem', fontWeight: '700', color: 'var(--platform-danger)', display: 'block' },
        oldPrice: { fontSize: '1rem', textDecoration: 'line-through', color: 'var(--platform-text-secondary)', marginBottom: '4px', display: 'block' },
        controls: { display: 'flex', alignItems: 'center', gap: '15px' },
        qtyWrapper: { display: 'flex', alignItems: 'center', background: 'var(--platform-bg)', borderRadius: '8px', border: '1px solid var(--platform-border-color)', padding: '4px' },
        qtyBtn: { width: '36px', height: '36px', border: '1px solid transparent', background: 'transparent', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--platform-text-primary)', transition: 'all 0.2s' },
        qtyValue: { width: '40px', textAlign: 'center', fontWeight: '600', fontSize: '1.1rem', color: 'var(--platform-text-primary)' },
        removeBtn: { background: 'transparent', border: 'none', color: 'var(--platform-text-secondary)', cursor: 'pointer', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
        summaryCard: { background: 'var(--platform-card-bg)', border: '1px solid var(--platform-border-color)', borderRadius: '16px', padding: '30px', position: 'sticky', top: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
        summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.05rem', color: 'var(--platform-text-secondary)' },
        totalRow: { display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--platform-border-color)', fontSize: '1.6rem', fontWeight: '700', color: 'var(--platform-text-primary)', marginBottom: '30px' },
        checkoutBtn: { width: '100%', padding: '18px', background: 'var(--platform-accent)', color: 'var(--platform-accent-text)', border: 'none', borderRadius: '10px', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px', transition: 'all 0.2s' },
        clearBtn: { width: '100%', padding: '14px', background: 'transparent', border: '1px solid var(--platform-border-color)', color: 'var(--platform-text-secondary)', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s' },
        emptyState: { textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', flex: 1, justifyContent: 'center' }
    };

    return (
        <div style={styles.pageContainer}>
            <style>{cssStyles}</style>
            {cartItems.length === 0 ? (
                <div style={styles.emptyState}>
                    <PackageOpen size={80} style={{ color: 'var(--platform-text-secondary)', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--platform-text-primary)' }}>Кошик порожній</h3>
                    <Link to="/" style={{textDecoration: 'none'}}>
                        <button className="checkout-btn hover-btn" style={{...styles.checkoutBtn, width: 'auto', padding: '14px 40px', marginBottom: 0, cursor: 'pointer'}}>
                            <ArrowLeft size={20} style={{marginRight: '8px'}}/> До каталогу
                        </button>
                    </Link>
                </div>
            ) : (
                <>
                    <div style={styles.header}>
                        <h2 style={styles.title}>Оформлення замовлення</h2>
                        <div style={styles.subtitle}>
                            {totalItemsCount} {totalItemsCount === 1 ? 'товар' : 'товарів'} на суму {total.toFixed(0)} ₴
                        </div>
                    </div>
                    <div className="cart-grid">
                        <div style={styles.tableContainer}>
                            {groupedItems.map((group, groupIndex) => (
                                <React.Fragment key={group.siteId}>
                                    <div style={{ ...styles.storeHeader, borderTop: groupIndex > 0 ? '1px solid var(--platform-border-color)' : 'none' }}>
                                        <Store size={24} /> <span>{group.siteName}</span>
                                    </div>
                                    {group.items.map((item, idx) => {
                                        const isLastInGroup = idx === group.items.length - 1;
                                        const itemPrice = parseFloat(item.price);
                                        const itemOriginalPrice = item.originalPrice ? parseFloat(item.originalPrice) : null;
                                        const hasDiscount = itemOriginalPrice && itemOriginalPrice > itemPrice;
                                        const totalItemPrice = itemPrice * item.quantity;
                                        const totalItemOriginalPrice = hasDiscount ? itemOriginalPrice * item.quantity : 0;
                                        return (
                                            <div key={item.cartItemId} style={{...styles.itemRow, borderBottom: isLastInGroup ? 'none' : '1px solid var(--platform-border-color)'}}>
                                                <Link to={`/product/${item.id}`} style={styles.imageWrapper}>
                                                    <img src={getImageUrl(item)} alt={item.name} style={styles.image} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/120x120?text=Error'; }} />
                                                </Link>
                                                <div style={styles.infoCol}>
                                                    <Link to={`/product/${item.id}`} style={styles.productName} className="product-link hover-btn">
                                                        {item.name} {item.type === 'digital' && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded align-middle">Цифровий</span>}
                                                    </Link>
                                                    <div style={styles.metaInfo}>
                                                        {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                                                            <span key={k} style={{background: 'var(--platform-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--platform-border-color)'}}>
                                                                {k}: <b>{v}</b>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={styles.controls}>
                                                    <div style={styles.qtyWrapper}>
                                                        <button style={styles.qtyBtn} className="qty-btn hover-btn" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} disabled={item.quantity <= 1}><Minus size={16}/></button>
                                                        <div style={styles.qtyValue}>{item.quantity}</div>
                                                        <button style={styles.qtyBtn} className="qty-btn hover-btn" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}><Plus size={16}/></button>
                                                    </div>
                                                </div>
                                                <div style={styles.priceCol}>
                                                    {hasDiscount ? (
                                                        <>
                                                            <span style={styles.oldPrice}>{totalItemOriginalPrice.toFixed(0)} ₴</span>
                                                            <span style={styles.salePrice}>{totalItemPrice.toFixed(0)} ₴</span>
                                                        </>
                                                    ) : (
                                                        <span style={styles.price}>{totalItemPrice.toFixed(0)} ₴</span>
                                                    )}
                                                    <div style={{marginTop: 'auto', paddingTop: '15px'}}>
                                                        <button style={styles.removeBtn} className="remove-btn hover-btn" onClick={() => removeFromCart(item.cartItemId)} title="Видалити">
                                                            <Trash2 size={20}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                        <form onSubmit={handleCheckout} style={styles.summaryCard} className="summary-card">
                            <h3 style={{fontSize: '1.4rem', marginBottom: '20px', color: 'var(--platform-text-primary)'}}>Контактні дані</h3>
                            <div className="flex flex-col gap-1 mb-6">
                                <Input 
                                    leftIcon={<User size={18}/>}
                                    placeholder="Ваше ПІБ"
                                    value={customerData.name}
                                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                                    required
                                />
                                <Input 
                                    leftIcon={<Mail size={18}/>}
                                    type="email"
                                    placeholder="Email (для відправки чеку/файлів)"
                                    value={customerData.email}
                                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                                    required
                                    helperText={isDigitalOnly ? "На цей email буде надіслано доступ до файлів" : ""}
                                />
                                <Input 
                                    leftIcon={<Phone size={18}/>}
                                    type="tel"
                                    placeholder="Номер телефону"
                                    value={customerData.phone}
                                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                                    required
                                />
                                {!isDigitalOnly && (
                                    <Input 
                                        leftIcon={<MapPin size={18}/>}
                                        placeholder="Місто та відділення пошти"
                                        value={customerData.address}
                                        onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                                        required
                                    />
                                )}
                            </div>
                            <div style={styles.summaryRow}>
                                <span>Товари ({totalItemsCount} шт.)</span>
                                <span>{totalOriginal.toFixed(2)} ₴</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div style={styles.summaryRow}>
                                    <span>Знижка</span>
                                    <span style={{color: 'var(--platform-danger)', fontWeight: '600'}}>-{totalDiscount.toFixed(2)} ₴</span>
                                </div>
                            )}
                            {isDigitalOnly ? (
                                <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#3b82f6', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <AlertCircle size={16} style={{flexShrink: 0}} />
                                    <span>Доставка не потрібна (цифрові товари)</span>
                                </div>
                            ) : (
                                <div style={{ marginTop: '10px', padding: '12px', background: 'var(--platform-bg)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--platform-text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <AlertCircle size={16} style={{flexShrink: 0}} />
                                    <span>Доставка оплачується при отриманні.</span>
                                </div>
                            )}
                            <div style={styles.totalRow}>
                                <span>До сплати</span>
                                <span>{total.toFixed(2)} ₴</span>
                            </div>
                            <button type="submit" style={styles.checkoutBtn} className="checkout-btn hover-btn" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="animate-spin" size={24} /> Перенаправляємо...</> : <><CreditCard size={24} /> Оплатити замовлення</>}
                            </button>
                            <button type="button" style={styles.clearBtn} className="clear-btn hover-btn" onClick={clearCart}>
                                Очистити кошик
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;