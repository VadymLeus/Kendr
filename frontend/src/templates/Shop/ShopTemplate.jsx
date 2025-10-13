// frontend/src/templates/Shop/ShopTemplate.jsx
import React, { useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Хук для навігації
import { AuthContext } from '../../features/auth/AuthContext';
import { CartContext } from '../../features/cart/CartContext';

const API_URL = 'http://localhost:5000';

const ShopTemplate = ({ content, products, siteOwnerId }) => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate(); // Ініціалізуємо useNavigate

    const headerTitle = content?.headerTitle || 'Назва магазину';
    const footerText = content?.footerText || `© ${new Date().getFullYear()} Мій Магазин`;
    const productList = Array.isArray(products) ? products : [];

    // Обробник додавання товару до кошика
    const handleAddToCart = (product) => {
        if (!user) {
            if (window.confirm("Щоб додати товар у кошик, необхідно увійти до акаунту. Перейти на сторінку входу?")) {
                navigate('/login');
            }
            return;
        }
        addToCart(product);
    };

    // Групуємо товари за категоріями за допомогою useMemo для оптимізації
    const groupedProducts = useMemo(() => {
        if (!productList.length) return {};

        return productList.reduce((acc, product) => {
            // Товари без категорії потрапляють до спеціальної групи
            const categoryName = product.category_name || 'Різне';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(product);
            return acc;
        }, {});
    }, [productList]);
    
    // Отримуємо відсортований список назв категорій
    const categoryNames = Object.keys(groupedProducts).sort();

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
            <header style={{ textAlign: 'center', padding: '2rem 0', borderBottom: '1px solid #eee' }}>
                <h1>{headerTitle}</h1>
            </header>
            <main style={{ padding: '2rem' }}>
                {productList.length > 0 ? (
                    // Проходимося по згрупованих товарах
                    categoryNames.map(categoryName => (
                        <div key={categoryName} style={{ marginBottom: '3rem' }}>
                            <h2 style={{ borderBottom: '2px solid #007BFF', paddingBottom: '0.5rem' }}>{categoryName}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                                {groupedProducts[categoryName].map((product) => {
                                    const isOwner = user && user.id === siteOwnerId;
                                    const isProductOwner = user && user.id === product.user_id; // Власник конкретного товару

                                    return (
                                        <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                                            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <img
                                                    src={product.image_url ? `${API_URL}${product.image_url}` : 'https://placehold.co/300x200'}
                                                    alt={product.name}
                                                    style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                                                />
                                            </Link>
                                            <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
                                                <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#007BFF', marginTop: 'auto' }}>{product.price} грн.</p>
                                            </div>
                                            <div style={{ padding: '0 1rem 1rem', display: 'flex', gap: '0.5rem' }}>
                                                 <Link to={`/product/${product.id}`} style={{ flex: 1 }}>
                                                    <button style={{ width: '100%', padding: '0.5rem', cursor: 'pointer' }}>
                                                        Деталі
                                                    </button>
                                                 </Link>
                                                <button
                                                    onClick={() => handleAddToCart(product)} // Використовуємо новий обробник
                                                    disabled={isProductOwner} // Блокуємо, якщо користувач - власник товару
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.5rem',
                                                        backgroundColor: isProductOwner ? '#ccc' : (user ? '#28a745' : '#ffc107'),
                                                        color: isProductOwner ? '#666' : 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: isProductOwner ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    {isProductOwner ? 'Ваш товар' : (user ? 'В кошик' : 'Купити')}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center' }}>У цьому магазині поки що немає товарів.</p>
                )}
            </main>
            <footer style={{ textAlign: 'center', padding: '2rem 0', borderTop: '1px solid #eee', marginTop: '2rem' }}>
                <p>{footerText}</p>
            </footer>
        </div>
    );
};

export default ShopTemplate;