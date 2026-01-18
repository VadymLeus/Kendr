// frontend/src/modules/dashboard/features/tabs/OrdersTab.jsx
import React from 'react';
import { Construction, Clock, ShoppingCart } from 'lucide-react';

const OrdersTab = () => {
    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--platform-text-primary)'
        }}>
            <div style={{ 
                background: 'var(--platform-card-bg)', 
                padding: '40px', 
                borderRadius: '16px', 
                border: '1px solid var(--platform-border-color)',
                maxWidth: '500px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: 'rgba(var(--platform-accent-rgb, 59, 130, 246), 0.1)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '10px'
                }}>
                    <Construction size={40} color="var(--platform-accent)" />
                </div>

                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', fontWeight: '600' }}>
                        Розділ в розробці
                    </h2>
                    <p style={{ color: 'var(--platform-text-secondary)', lineHeight: '1.6' }}>
                        Повноцінна система управління замовленнями (Order Management System) буде додана в найближчих оновленнях.
                    </p>
                </div>

                <div style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    marginTop: '10px', 
                    fontSize: '0.9rem', 
                    color: 'var(--platform-text-secondary)',
                    background: 'var(--platform-bg)',
                    padding: '15px',
                    borderRadius: '8px',
                    width: '100%'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
                        <ShoppingCart size={16} /> <span>Кошик</span>
                    </div>
                    <div style={{ width: '1px', background: 'var(--platform-border-color)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
                        <Clock size={16} /> <span>Історія</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersTab;