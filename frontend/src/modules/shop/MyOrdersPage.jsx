// frontend/src/modules/shop/MyOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../shared/api/api';
import EmptyState from '../../shared/ui/complex/EmptyState';
import { Button } from '../../shared/ui/elements/Button';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, CreditCard, ChevronDown, ChevronUp, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

const STATUS_MAP = {
    pending: { label: 'Очікує оплати', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock },
    paid: { label: 'Оплачено', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CreditCard },
    shipped: { label: 'Відправлено', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Package },
    completed: { label: 'Виконано', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
    cancelled: { label: 'Скасовано', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle }
};

const OrderCard = ({ order, onPay }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const statusConfig = STATUS_MAP[order.status] || STATUS_MAP.pending;
    const StatusIcon = statusConfig.icon;
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}.${month}.${year} о ${hours}:${minutes}`;
    };
    const handlePayClick = async (e) => {
        e.stopPropagation();
        setIsPaying(true);
        await onPay(order.id);
        setIsPaying(false);
    };
    return (
        <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl overflow-hidden mb-4 transition-all hover:shadow-sm">
            <div 
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-full shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h3 className="font-bold text-(--platform-text-primary) text-lg m-0">
                                Замовлення #{order.id}
                            </h3>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <p className="text-sm text-(--platform-text-secondary) m-0">
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full border-t md:border-t-0 pt-4 md:pt-0 border-(--platform-border-color)">
                    <div className="text-left md:text-right">
                        <p className="text-sm text-(--platform-text-secondary) m-0 mb-1">Сума</p>
                        <p className="font-bold text-(--platform-text-primary) text-lg m-0">
                            {parseFloat(order.total_amount).toFixed(2)} ₴
                        </p>
                    </div>
                    {order.status === 'pending' && (
                        <Button 
                            onClick={handlePayClick} 
                            disabled={isPaying}
                            className="bg-orange-600 hover:bg-orange-700 text-white shrink-0 border-none shadow-md transition-transform hover:-translate-y-0.5"
                        >
                            {isPaying ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                            Оплатити зараз
                        </Button>
                    )}
                    <div className="text-(--platform-text-secondary)">
                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-(--platform-border-color) bg-(--platform-bg) p-5 animate-in slide-in-from-top-2 duration-200">
                    {order.status === 'pending' && order.items.some(i => i.type === 'digital') && (
                        <div className="mb-6 p-4 rounded-lg flex gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500">
                            <AlertCircle className="shrink-0 mt-0.5" size={20} />
                            <div className="text-sm">
                                <p className="font-semibold mb-1 m-0">У замовленні є цифрові товари</p>
                                <p className="m-0">Оплатіть замовлення, щоб отримати доступ до посилань та файлів.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                        <div>
                            <h4 className="font-semibold text-(--platform-text-primary) mb-3 text-sm uppercase tracking-wider opacity-80">Товари ({order.items.length})</h4>
                            <div className="space-y-4">
                                {order.items.map(item => {
                                    const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
                                    const isUrl = item.digital_file_url?.startsWith('http');
                                    return (
                                        <div key={item.id} className="flex flex-col gap-2 p-3 bg-(--platform-card-bg) rounded-lg border border-(--platform-border-color)">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="font-medium text-(--platform-text-primary) m-0 text-sm">
                                                        {item.product_name}
                                                    </p>
                                                    {options && Object.keys(options).length > 0 && (
                                                        <div className="text-xs text-(--platform-text-secondary) mt-1">
                                                            {Object.entries(options).map(([key, val]) => (
                                                                <span key={key} className="mr-3">{key}: <span className="font-medium">{val.label}</span></span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-medium text-sm m-0">{item.price} ₴</p>
                                                    <p className="text-xs text-(--platform-text-secondary) m-0">{item.quantity} шт.</p>
                                                </div>
                                            </div>
                                            {item.type === 'digital' && item.digital_file_url && (
                                                <div className="mt-2 pt-2 border-t border-dashed border-(--platform-border-color)">
                                                    {isUrl ? (
                                                        <a 
                                                            href={item.digital_file_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--platform-accent) hover:underline"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <ExternalLink size={14} /> Переглянути / Завантажити
                                                        </a>
                                                    ) : (
                                                        <div>
                                                            <p className="text-xs text-(--platform-text-secondary) mb-1 m-0">Секретний код/текст:</p>
                                                            <div className="bg-(--platform-bg) px-2 py-1.5 rounded text-xs font-mono font-medium border border-(--platform-border-color) break-all text-(--platform-text-primary)">
                                                                {item.digital_file_url}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-(--platform-text-primary) mb-3 text-sm uppercase tracking-wider opacity-80">Деталі доставки</h4>
                            <div className="bg-(--platform-card-bg) rounded-lg p-4 border border-(--platform-border-color) text-sm space-y-2">
                                <p className="m-0"><span className="text-(--platform-text-secondary)">Отримувач:</span> <span className="font-medium text-(--platform-text-primary)">{order.customer_name}</span></p>
                                <p className="m-0"><span className="text-(--platform-text-secondary)">Телефон:</span> <span className="font-medium text-(--platform-text-primary)">{order.customer_phone}</span></p>
                                <p className="m-0"><span className="text-(--platform-text-secondary)">Email:</span> <span className="font-medium text-(--platform-text-primary)">{order.customer_email}</span></p>
                                <hr className="my-2 border-(--platform-border-color)" />
                                <p className="m-0 text-(--platform-text-secondary)">Адреса:</p>
                                <p className="m-0 font-medium text-(--platform-text-primary)">{order.delivery_address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await apiClient.get('/orders/my');
                setOrders(res.data);
            } catch (error) {
                console.error('Помилка завантаження замовлень', error);
                toast.error('Не вдалося завантажити історію замовлень');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handlePayExistingOrder = async (orderId) => {
        try {
            const response = await apiClient.post(`/orders/${orderId}/pay`);
            if (response.data && response.data.data && response.data.signature) {
                const { data, signature } = response.data;
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
            }
        } catch (error) {
            console.error('Помилка створення оплати:', error);
            toast.error(error.response?.data?.message || 'Не вдалося створити платіж. Спробуйте пізніше.');
        }
    };
    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto w-full">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-(--platform-border-color) rounded w-1/4 mb-8"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-(--platform-border-color) rounded-xl w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
            <h1 className="text-2xl font-bold mb-6 text-(--platform-text-primary) flex items-center gap-3">
                <Package className="text-(--platform-accent)" /> Мої замовлення
            </h1>
            {orders.length === 0 ? (
                <EmptyState 
                    icon={Package}
                    title="У вас ще немає замовлень"
                    description="Зробіть свою першу покупку в каталозі сайтів, і вона з'явиться тут."
                    action={<Button as={Link} to="/catalog">Перейти до каталогу</Button>}
                />
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <OrderCard 
                            key={order.id} 
                            order={order} 
                            onPay={handlePayExistingOrder} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;