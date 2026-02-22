// frontend/src/modules/features/shop/OrdersTab.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../shared/api/api';
import { toast } from 'react-toastify';
import { Package, MapPin, User, Mail, Phone, Calendar, Clock, AlertCircle } from 'lucide-react';

const OrdersTab = ({ site, siteData }) => {
    const currentSite = site || siteData;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!currentSite?.id) {
            setLoading(false);
            return;
        }
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get(`/orders/site/${currentSite.id}`);
                setOrders(res.data || []);
            } catch (err) {
                console.error(err);
                toast.error('Не вдалося завантажити замовлення');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentSite]);

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleString('uk-UA', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute:'2-digit' 
        });
    };

    const getStatusBadge = (status) => {
        const maps = {
            'pending': { label: 'Очікує оплати', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
            'paid': { label: 'Оплачено', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            'shipped': { label: 'Відправлено', color: 'bg-purple-100 text-purple-700 border-purple-200' },
            'completed': { label: 'Виконано', color: 'bg-green-100 text-green-700 border-green-200' },
            'cancelled': { label: 'Скасовано', color: 'bg-red-100 text-red-700 border-red-200' }
        };
        const config = maps[status] || maps['pending'];
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return <div className="p-10 text-center text-(--platform-text-secondary)">Завантаження замовлень...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-(--platform-text-primary)">
                <div className="w-20 h-20 bg-(--platform-hover-bg) rounded-full flex items-center justify-center mb-4">
                    <Package size={32} className="text-(--platform-text-secondary) opacity-50" />
                </div>
                <h2 className="text-xl mb-2 font-semibold">Замовлень поки немає</h2>
                <p className="text-(--platform-text-secondary)">Коли клієнти зроблять покупку, вони з'являться тут.</p>
            </div>
        );
    }

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar bg-(--platform-bg)">
            <h2 className="text-2xl font-bold mb-6 text-(--platform-text-primary)">Замовлення ({orders.length})</h2>
            <div className="flex flex-col gap-5">
                {orders.map(order => (
                    <div key={order.id} className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-start border-b border-(--platform-border-color) pb-4 mb-4 flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-lg text-(--platform-text-primary)">Замовлення #{order.id}</span>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-(--platform-text-secondary)">
                                    <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(order.created_at)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-(--platform-text-secondary) mb-1">Сума замовлення</div>
                                <div className="text-xl font-bold text-(--platform-text-primary)">{parseFloat(order.total_amount).toFixed(2)} ₴</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-(--platform-hover-bg) p-4 rounded-lg text-sm text-(--platform-text-primary)">
                                <h4 className="font-bold mb-3 flex items-center gap-2 border-b border-(--platform-border-color) pb-2"><User size={16}/> Дані клієнта</h4>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2"><span className="text-(--platform-text-secondary) w-20">Ім'я:</span> <span className="font-medium">{order.customer_name}</span></div>
                                    <div className="flex gap-2"><span className="text-(--platform-text-secondary) w-20">Email:</span> <a href={`mailto:${order.customer_email}`} className="text-(--platform-accent) hover:underline">{order.customer_email}</a></div>
                                    <div className="flex gap-2"><span className="text-(--platform-text-secondary) w-20">Телефон:</span> <span>{order.customer_phone || '-'}</span></div>
                                    <div className="flex gap-2 mt-2 pt-2 border-t border-(--platform-border-color)/50">
                                        <MapPin size={16} className="text-(--platform-text-secondary) shrink-0 mt-0.5"/> 
                                        <span className={order.delivery_address === 'Цифрова доставка' ? 'text-blue-500 font-medium' : ''}>
                                            {order.delivery_address || 'Не вказано'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold mb-3 text-sm text-(--platform-text-primary)">Товари ({order.items?.length || 0})</h4>
                                <div className="flex flex-col gap-2">
                                    {order.items?.map(item => {
                                        const opts = item.options ? (typeof item.options === 'string' ? JSON.parse(item.options) : item.options) : {};
                                        return (
                                            <div key={item.id} className="flex justify-between items-start text-sm p-3 border border-(--platform-border-color) rounded-lg bg-(--platform-bg)">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-(--platform-text-primary)">
                                                        {item.product_name}
                                                        {item.type === 'digital' && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">Цифр.</span>}
                                                    </span>
                                                    {Object.entries(opts).length > 0 && (
                                                        <span className="text-xs text-(--platform-text-secondary) mt-1">
                                                            Опції: {Object.entries(opts).map(([k,v]) => `${k}=${v}`).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right ml-4 shrink-0">
                                                    <div className="font-semibold">{item.quantity} шт.</div>
                                                    <div className="text-(--platform-text-secondary) text-xs">{parseFloat(item.price).toFixed(0)} ₴/шт.</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersTab;