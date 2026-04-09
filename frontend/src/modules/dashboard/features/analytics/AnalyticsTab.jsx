// frontend/src/modules/dashboard/features/analytics/AnalyticsTab.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../shared/api/api';
import { Eye, Package, CheckCircle, DollarSign, Clock, XCircle, Ban, ArrowRight, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingState from '../../../../shared/ui/complex/LoadingState';

const STATUS_CONFIG = {
    pending: { label: 'В очікуванні', color: 'var(--platform-warning)', bg: 'color-mix(in srgb, var(--platform-warning), transparent 90%)', icon: Clock },
    paid: { label: 'Оплачено', color: 'var(--platform-success)', bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', icon: DollarSign },
    shipped: { label: 'Відправлено', color: 'var(--platform-accent)', bg: 'color-mix(in srgb, var(--platform-accent), transparent 90%)', icon: Package },
    completed: { label: 'Виконано', color: 'var(--platform-success)', bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', icon: CheckCircle },
    cancelled: { label: 'Скасовано', color: 'var(--platform-danger)', bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', icon: Ban },
};

const currencyMap = { 'UAH': '₴', 'USD': '$', 'EUR': '€' };
const Widget = ({ title, value, icon, colorClass }) => (
    <div className="bg-(--platform-card-bg) p-6 rounded-xl border border-(--platform-border-color) shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
        <div className={`p-4 rounded-xl ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-(--platform-text-secondary) font-medium mb-1">{title}</p>
            <h4 className="text-3xl font-bold text-(--platform-text-primary) m-0 leading-none">{value}</h4>
        </div>
    </div>
);

const AnalyticsTab = ({ siteData, onGoToOrders }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (!siteData?.id) return;
        const fetchAnalytics = async () => {
            try {
                const response = await apiClient.get(`/sites/${siteData.id}/analytics`);
                setData(response.data);
            } catch (error) {
                console.error('Помилка завантаження аналітики:', error);
                toast.error('Не вдалося завантажити аналітику');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [siteData?.id]);

    if (isLoading) return <LoadingState title="Збираємо статистику..." />;
    if (!data) return null;
    const currencySymbol = currencyMap[data.currency] || data.currency;
    const formattedRevenue = new Intl.NumberFormat('uk-UA', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    }).format(data.revenue);
    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-(--platform-text-primary) mb-2">Огляд ефективності</h2>
                <p className="text-(--platform-text-secondary) m-0">Ключові показники вашого проєкту за весь час.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                <Widget 
                    title="Перегляди сайту" 
                    value={data.views} 
                    icon={<Eye size={28} />} 
                    colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                />
                <Widget 
                    title="Усього замовлень" 
                    value={data.totalOrders} 
                    icon={<Package size={28} />} 
                    colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
                />
                <Widget 
                    title="Успішні продажі" 
                    value={data.completedOrders} 
                    icon={<CheckCircle size={28} />} 
                    colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                />
                <Widget 
                    title="Загальний дохід" 
                    value={`${formattedRevenue} ${currencySymbol}`} 
                    icon={<TrendingUp size={28} />} 
                    colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
                />
            </div>
            <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-(--platform-border-color) flex justify-between items-center">
                    <h3 className="text-lg font-bold text-(--platform-text-primary) m-0">Останні замовлення</h3>
                    <button 
                        onClick={onGoToOrders}
                        className="text-sm font-medium text-(--platform-accent) hover:text-(--platform-accent-hover) bg-transparent border-none cursor-pointer flex items-center gap-1 transition-colors"
                    >
                        Всі замовлення <ArrowRight size={16} />
                    </button>
                </div>
                {data.recentOrders?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-(--platform-bg) border-b border-(--platform-border-color)">
                                    <th className="p-4 text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider">ID</th>
                                    <th className="p-4 text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider">Покупець</th>
                                    <th className="p-4 text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider">Сума</th>
                                    <th className="p-4 text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider">Дата</th>
                                    <th className="p-4 text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider text-right">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentOrders.map((order) => {
                                    const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                    const Icon = st.icon;
                                    return (
                                        <tr key={order.id} className="border-b border-(--platform-border-color) hover:bg-(--platform-hover-bg) transition-colors">
                                            <td className="p-4 font-mono text-sm text-(--platform-text-secondary)">
                                                {order.id.slice(0, 8)}...
                                            </td>
                                            <td className="p-4 text-sm font-medium text-(--platform-text-primary)">
                                                {order.customer_name}
                                            </td>
                                            <td className="p-4 text-sm font-bold text-(--platform-text-primary)">
                                                {Number(order.total_amount).toFixed(2)} <span className="text-xs opacity-70 font-normal">{data.currency}</span>
                                            </td>
                                            <td className="p-4 text-sm text-(--platform-text-secondary)">
                                                {new Date(order.created_at).toLocaleDateString('uk-UA')}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span 
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                                                    style={{ backgroundColor: st.bg, color: st.color }}
                                                >
                                                    <Icon size={12} /> {st.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 text-center text-(--platform-text-secondary) flex flex-col items-center gap-3">
                        <Package size={40} className="opacity-20" />
                        <p className="m-0">У вас ще немає замовлень.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsTab;