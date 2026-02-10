// frontend/src/modules/features/shop/OrdersTab.jsx
import React from 'react';
import { Construction, Clock, ShoppingCart } from 'lucide-react';

const OrdersTab = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-(--platform-text-primary)">
            <div className="bg-(--platform-card-bg) p-10 rounded-2xl border border-(--platform-border-color) max-w-125 flex flex-col items-center gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-20 h-20 bg-[rgba(59,130,246,0.1)] rounded-full flex items-center justify-center mb-2.5">
                    <Construction size={40} className="text-(--platform-accent)" />
                </div>
                <div>
                    <h2 className="text-2xl mb-2.5 font-semibold">
                        Розділ в розробці
                    </h2>
                    <p className="text-(--platform-text-secondary) leading-relaxed">
                        Повноцінна система управління замовленнями (Order Management System) буде додана в найближчих оновленнях.
                    </p>
                </div>
                <div className="flex gap-4 mt-2.5 text-sm text-(--platform-text-secondary) bg-(--platform-bg) p-4 rounded-lg w-full">
                    <div className="flex items-center gap-2 flex-1 justify-center">
                        <ShoppingCart size={16} /> <span>Кошик</span>
                    </div>
                    <div className="w-px bg-(--platform-border-color)"></div>
                    <div className="flex items-center gap-2 flex-1 justify-center">
                        <Clock size={16} /> <span>Історія</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersTab;