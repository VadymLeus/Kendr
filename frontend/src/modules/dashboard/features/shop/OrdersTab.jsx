// frontend/src/modules/features/shop/OrdersTab.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../shared/api/api';
import { toast } from 'react-toastify';
import { Package, MapPin, User, Calendar } from 'lucide-react';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';

const STATUS_MAP = {
    'pending': { label: 'Очікує оплати', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-500' },
    'paid': { label: 'Оплачено (В обробці)', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-500' },
    'shipped': { label: 'Відправлено', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-500' },
    'completed': { label: 'Виконано', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-500' },
    'cancelled': { label: 'Скасовано', color: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-500' }
};
const STATUS_OPTIONS = Object.entries(STATUS_MAP)
    .filter(([key]) => key !== 'pending')
    .map(([key, val]) => ({
        value: key,
        label: val.label
    }));

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
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success('Статус замовлення оновлено');
        } catch (error) {
            console.error('Помилка оновлення статусу:', error);
            toast.error('Не вдалося оновити статус');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} о ${hours}:${minutes}`;
    };

    const getStatusControl = (order) => {
        const hasItems = order.items && order.items.length > 0;
        const isDigitalOnly = hasItems && order.items.every(item => item.type === 'digital');
        const isDisabled = order.status === 'pending' || isDigitalOnly;
        const config = STATUS_MAP[order.status] || STATUS_MAP['pending'];
        if (isDisabled) {
            return (
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 ${config.color}`}>
                    {config.label}
                    {isDigitalOnly && order.status !== 'pending' && order.status !== 'cancelled' && (
                        <span className="opacity-75 text-[10px] uppercase tracking-wider">(Авто)</span>
                    )}
                </span>
            );
        }
        return (
            <div className="w-50">
                <CustomSelect
                    name="status"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    options={STATUS_OPTIONS}
                />
            </div>
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
        <div className="px-6 pb-6 pt-2 h-full overflow-y-auto custom-scrollbar bg-(--platform-bg)">
            <div className="mb-6 shrink-0 flex flex-col items-center text-center">
                <h2 className="text-2xl font-semibold m-0 mb-1 text-(--platform-text-primary) flex items-center justify-center gap-2.5">
                    <Package size={28} />
                    Замовлення
                </h2>
                <p className="text-(--platform-text-secondary) m-0 text-sm">
                    Перегляд та управління замовленнями клієнтів
                </p>
            </div>
            <div className="flex flex-col gap-5">
                {orders.map(order => (
                    <div key={order.id} className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-start border-b border-(--platform-border-color) pb-4 mb-4 flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="font-bold text-lg text-(--platform-text-primary)">Замовлення #{order.id}</span>
                                    {getStatusControl(order)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-(--platform-text-secondary)">
                                    <span className="flex items-center gap-1.5"><Calendar size={14}/> {formatDate(order.created_at)}</span>
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
                                                        {item.type === 'digital' && <span className="ml-2 text-[10px] bg-blue-500/10 text-blue-600 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase">Цифр.</span>}
                                                    </span>
                                                    {Object.entries(opts).length > 0 && (
                                                        <span className="text-xs text-(--platform-text-secondary) mt-1">
                                                            Опції: {Object.entries(opts).map(([k,v]) => `${k}=${v.label || v}`).join(', ')}
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