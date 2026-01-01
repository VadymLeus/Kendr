// frontend/src/modules/shop/pages/CartPage.jsx
import React, { useContext, useMemo } from 'react';
import { CartContext } from '../../../app/providers/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';
import { 
    IconTrash, IconMinus, IconPlus, IconShop, 
    IconArrowLeft, IconCreditCard, IconTag, IconAlertCircle, IconEmptyBox 
} from '../../../common/components/ui/Icons';

const API_URL = 'http://localhost:5000';

const CartPage = () => {
    const { cartItems, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
    const navigate = useNavigate();

    // Групування товарів
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

    // Розрахунок сум
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

        return {
            total: currentSum,
            totalOriginal: originalSum,
            totalDiscount: originalSum - currentSum
        };
    }, [cartItems]);

    const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = async () => {
        try {
            await apiClient.post('/orders/checkout', { cartItems });
            toast.success('Дякуємо за покупку! Ваше замовлення успішно оформлено.');
            clearCart();
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error('Помилка оформлення замовлення');
        }
    };

    // --- ГОЛОВНИЙ ФІКС КАРТИНОК ---
    const getImageUrl = (item) => {
        // 1. Беремо саме image_gallery, бо так поле називається в твоїй БД
        let gallery = item.image_gallery || item.image_path || item.image;

        let targetPath = null;

        // 2. Оскільки бекенд вже парсить JSON, це часто приходить як справжній масив
        if (Array.isArray(gallery) && gallery.length > 0) {
            targetPath = gallery[0];
        } 
        // 3. Якщо раптом прийшов рядок JSON (страховка)
        else if (typeof gallery === 'string') {
            try {
                if (gallery.startsWith('[')) {
                    const parsed = JSON.parse(gallery);
                    targetPath = parsed[0];
                } else {
                    targetPath = gallery;
                }
            } catch (e) {
                targetPath = gallery;
            }
        }

        // 4. Якщо нічого не знайшли
        if (!targetPath) return 'https://placehold.co/120x120?text=No+Image';

        // 5. Якщо це вже повне посилання
        if (targetPath.startsWith('http')) return targetPath;

        // 6. Додаємо API URL. Твої шляхи в БД починаються з '/uploads/...', тому все буде ок.
        // Але про всяк випадок перевіримо слеш
        const cleanPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
        
        return `${API_URL}${cleanPath}`;
    };

    const cssStyles = `
        .cart-grid {
            display: grid;
            grid-template-columns: 1fr 340px; 
            gap: 30px;
            align-items: start;
            width: 100%;
        }

        .hover-btn {
            transition: all 0.2s ease-in-out;
        }
        
        .qty-btn:hover:not(:disabled) {
            background-color: var(--platform-border-color) !important;
            transform: translateY(-1px);
        }
        
        .remove-btn:hover {
            background-color: rgba(229, 62, 62, 0.1) !important;
            color: var(--platform-danger) !important;
            transform: scale(1.1);
        }

        .checkout-btn:hover {
            filter: brightness(1.05);
            transform: translateY(-2px);
        }

        .clear-btn:hover {
            background-color: var(--platform-bg) !important;
            color: var(--platform-text-primary) !important;
            border-color: var(--platform-text-primary) !important;
        }

        .product-link:hover {
            color: var(--platform-accent) !important;
            text-decoration: underline;
        }

        @media (max-width: 1100px) {
            .cart-grid {
                grid-template-columns: 1fr;
            }
            .summary-card {
                position: static !important;
                margin-top: 20px;
            }
        }
    `;

    const styles = {
        pageContainer: {
            width: '95%',
            maxWidth: '1920px',
            margin: '0 auto',
            padding: '40px 10px',
            minHeight: 'calc(100vh - 80px)',
        },
        header: {
            marginBottom: '30px',
            paddingLeft: '10px'
        },
        title: {
            fontSize: '2.2rem',
            fontWeight: '700',
            color: 'var(--platform-text-primary)',
            marginBottom: '5px',
        },
        subtitle: {
            color: 'var(--platform-text-secondary)',
            fontSize: '1.1rem',
        },
        tableContainer: {
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        },
        storeHeader: {
            background: 'var(--platform-bg)',
            padding: '25px 30px', 
            borderBottom: '1px solid var(--platform-border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontWeight: '800',
            color: 'var(--platform-text-primary)',
            fontSize: '1.5rem', 
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
        },
        itemRow: {
            display: 'flex',
            padding: '30px', 
            borderBottom: '1px solid var(--platform-border-color)',
            gap: '30px',
            alignItems: 'center',
            background: 'var(--platform-card-bg)',
        },
        imageWrapper: {
            width: '120px', 
            height: '120px',
            borderRadius: '12px',
            border: '1px solid var(--platform-border-color)',
            overflow: 'hidden',
            flexShrink: 0,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        image: {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '5px'
        },
        infoCol: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },
        productName: {
            fontSize: '1.3rem',
            fontWeight: '600',
            color: 'var(--platform-text-primary)',
            textDecoration: 'none',
        },
        metaInfo: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.95rem',
            color: 'var(--platform-text-secondary)',
        },
        priceCol: {
            textAlign: 'right',
            minWidth: '140px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center'
        },
        price: {
            fontSize: '1.4rem',
            fontWeight: '700',
            color: 'var(--platform-text-primary)',
            display: 'block',
        },
        salePrice: {
            fontSize: '1.4rem',
            fontWeight: '700',
            color: '#e53e3e',
            display: 'block',
        },
        oldPrice: {
            fontSize: '1rem',
            textDecoration: 'line-through',
            color: 'var(--platform-text-secondary)',
            marginBottom: '4px',
            display: 'block',
        },
        controls: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
        },
        qtyWrapper: {
            display: 'flex',
            alignItems: 'center',
            background: 'var(--platform-bg)',
            borderRadius: '8px',
            border: '1px solid var(--platform-border-color)',
            padding: '4px',
        },
        qtyBtn: {
            width: '36px',
            height: '36px',
            border: 'none',
            background: 'transparent',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--platform-text-primary)',
        },
        qtyValue: {
            width: '40px',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '1.1rem',
        },
        removeBtn: {
            background: 'transparent',
            border: 'none',
            color: 'var(--platform-text-secondary)',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        summaryCard: {
            background: 'var(--platform-card-bg)',
            border: '1px solid var(--platform-border-color)',
            borderRadius: '16px',
            padding: '30px',
            position: 'sticky',
            top: '100px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        },
        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            fontSize: '1.05rem',
            color: 'var(--platform-text-secondary)',
        },
        totalRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '25px',
            paddingTop: '25px',
            borderTop: '1px dashed var(--platform-border-color)',
            fontSize: '1.6rem',
            fontWeight: '700',
            color: 'var(--platform-text-primary)',
            marginBottom: '30px',
        },
        checkoutBtn: {
            width: '100%',
            padding: '18px',
            background: 'var(--platform-accent)',
            color: 'var(--platform-accent-text)',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px',
        },
        clearBtn: {
            width: '100%',
            padding: '14px',
            background: 'transparent',
            border: '1px solid var(--platform-border-color)',
            color: 'var(--platform-text-secondary)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '1rem',
        },
        emptyState: {
            textAlign: 'center',
            padding: '80px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
        }
    };

    return (
        <div style={styles.pageContainer}>
            <style>{cssStyles}</style>
            
            <div style={styles.header}>
                <h2 style={styles.title}>Ваш кошик</h2>
                {cartItems.length > 0 && (
                    <div style={styles.subtitle}>
                        {totalItemsCount} {totalItemsCount === 1 ? 'товар' : 'товарів'} на суму {total.toFixed(0)} ₴
                    </div>
                )}
            </div>

            {cartItems.length === 0 ? (
                <div style={styles.emptyState}>
                    <IconEmptyBox size={80} style={{ color: 'var(--platform-text-secondary)', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--platform-text-primary)' }}>Кошик порожній</h3>
                    <Link to="/" style={{textDecoration: 'none'}}>
                        <button 
                            className="checkout-btn hover-btn"
                            style={{
                                ...styles.checkoutBtn, 
                                width: 'auto', 
                                padding: '14px 40px', 
                                marginBottom: 0
                            }}
                        >
                            <IconArrowLeft size={20} style={{marginRight: '8px'}}/> До каталогу
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="cart-grid">
                    <div style={styles.tableContainer}>
                        {groupedItems.map((group, groupIndex) => (
                            <React.Fragment key={group.siteId}>
                                <div style={{
                                    ...styles.storeHeader,
                                    borderTop: groupIndex > 0 ? '1px solid var(--platform-border-color)' : 'none'
                                }}>
                                    <IconShop size={24} />
                                    <span>{group.siteName}</span>
                                </div>

                                {group.items.map((item, idx) => {
                                    const isLastInGroup = idx === group.items.length - 1;
                                    const rowStyle = {
                                        ...styles.itemRow,
                                        borderBottom: isLastInGroup ? 'none' : '1px solid var(--platform-border-color)'
                                    };

                                    const itemPrice = parseFloat(item.price);
                                    const itemOriginalPrice = item.originalPrice ? parseFloat(item.originalPrice) : null;
                                    const hasDiscount = itemOriginalPrice && itemOriginalPrice > itemPrice;
                                    
                                    const totalItemPrice = itemPrice * item.quantity;
                                    const totalItemOriginalPrice = hasDiscount ? itemOriginalPrice * item.quantity : 0;

                                    return (
                                        <div key={item.cartItemId} style={rowStyle}>
                                            <Link to={`/product/${item.id}`} style={styles.imageWrapper}>
                                                <img 
                                                    src={getImageUrl(item)} 
                                                    alt={item.name} 
                                                    style={styles.image}
                                                    onError={(e) => { 
                                                        e.target.onerror = null; 
                                                        e.target.src = 'https://placehold.co/120x120?text=Error'; 
                                                    }}
                                                />
                                            </Link>
                                            
                                            <div style={styles.infoCol}>
                                                <Link to={`/product/${item.id}`} style={styles.productName} className="product-link hover-btn">
                                                    {item.name}
                                                </Link>
                                                
                                                <div style={styles.metaInfo}>
                                                    {item.category_name && (
                                                        <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                            <IconTag size={14}/> {item.category_name}
                                                        </span>
                                                    )}
                                                    {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                                                        <span key={k} style={{background: 'var(--platform-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--platform-border-color)'}}>
                                                            {k}: <b>{v}</b>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={styles.controls}>
                                                <div style={styles.qtyWrapper}>
                                                    <button 
                                                        style={styles.qtyBtn} 
                                                        className="qty-btn hover-btn"
                                                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <IconMinus size={16}/>
                                                    </button>
                                                    <div style={styles.qtyValue}>{item.quantity}</div>
                                                    <button 
                                                        style={styles.qtyBtn}
                                                        className="qty-btn hover-btn"
                                                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                    >
                                                        <IconPlus size={16}/>
                                                    </button>
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
                                                    <button 
                                                        style={styles.removeBtn}
                                                        className="remove-btn hover-btn"
                                                        onClick={() => removeFromCart(item.cartItemId)}
                                                        title="Видалити з кошика"
                                                    >
                                                        <IconTrash size={20}/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>

                    <div style={styles.summaryCard} className="summary-card">
                        <h3 style={{fontSize: '1.4rem', marginBottom: '25px', color: 'var(--platform-text-primary)'}}>Підсумок</h3>
                        
                        <div style={styles.summaryRow}>
                            <span>Товари ({totalItemsCount} шт.)</span>
                            <span>{totalOriginal.toFixed(2)} ₴</span>
                        </div>
                        
                        {totalDiscount > 0 && (
                            <div style={styles.summaryRow}>
                                <span>Знижка</span>
                                <span style={{color: '#e53e3e', fontWeight: '600'}}>-{totalDiscount.toFixed(2)} ₴</span>
                            </div>
                        )}
                        
                        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--platform-bg)', borderRadius: '10px', fontSize: '0.9rem', color: 'var(--platform-text-secondary)', display: 'flex', gap: '10px', lineHeight: '1.4' }}>
                            <IconAlertCircle size={20} style={{flexShrink: 0, marginTop: '2px'}} />
                            <div>Доставка розраховується при оформленні.</div>
                        </div>

                        <div style={styles.totalRow}>
                            <span>До сплати</span>
                            <span>{total.toFixed(2)} ₴</span>
                        </div>

                        <button style={styles.checkoutBtn} className="checkout-btn hover-btn" onClick={handleCheckout}>
                            <IconCreditCard size={24} /> Оформити
                        </button>
                        
                        <button style={styles.clearBtn} className="clear-btn hover-btn" onClick={clearCart}>
                            Очистити кошик
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;