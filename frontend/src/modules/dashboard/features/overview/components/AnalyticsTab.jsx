// frontend/src/modules/dashboard/features/overview/components/AnalyticsTab.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../../../shared/api/api';
import { toast } from 'react-toastify';
import LoadingState from '../../../../../shared/ui/complex/LoadingState';
import { Eye, Package, CheckCircle, DollarSign, Clock, Ban, ArrowRight, TrendingUp } from 'lucide-react';

const STATUS_CONFIG = {
    pending: { label: 'В очікуванні', color: 'var(--platform-warning)', bg: 'color-mix(in srgb, var(--platform-warning), transparent 90%)', icon: Clock },
    paid: { label: 'Оплачено', color: 'var(--platform-success)', bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', icon: DollarSign },
    shipped: { label: 'Відправлено', color: 'var(--platform-accent)', bg: 'color-mix(in srgb, var(--platform-accent), transparent 90%)', icon: Package },
    completed: { label: 'Виконано', color: 'var(--platform-success)', bg: 'color-mix(in srgb, var(--platform-success), transparent 90%)', icon: CheckCircle },
    cancelled: { label: 'Скасовано', color: 'var(--platform-danger)', bg: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', icon: Ban },
};

const currencyMap = { 'UAH': '₴', 'USD': '$', 'EUR': '€' };
const Widget = ({ title, value, icon, colorClass }) => (
    <div className="bg-(--platform-card-bg) p-4 xl:p-5 2xl:p-6 rounded-xl border border-(--platform-border-color) shadow-sm flex items-center gap-4 2xl:gap-5 transition-all hover:shadow-md h-full min-w-0">
        <div className={`p-3 2xl:p-4 rounded-xl shrink-0 flex items-center justify-center ${colorClass}`}>
            {React.cloneElement(icon, { className: 'w-6 h-6 2xl:w-7 2xl:h-7' })}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs 2xl:text-sm text-(--platform-text-secondary) font-medium mb-1 2xl:mb-1.5 truncate" title={title}>
                {title}
            </p>
            <h4 className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-(--platform-text-primary) m-0 leading-none truncate" title={String(value)}>
                {value}
            </h4>
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
        <div className="animate-in fade-in duration-300 w-full h-full flex flex-col box-border">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 2xl:gap-5 mb-6 2xl:mb-8 mt-2 shrink-0">
                <Widget 
                    title="Перегляди сайту" 
                    value={data.views} 
                    icon={<Eye />} 
                    colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                />
                <Widget 
                    title="Усього замовлень" 
                    value={data.totalOrders} 
                    icon={<Package />} 
                    colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
                />
                <Widget 
                    title="Успішні продажі" 
                    value={data.completedOrders} 
                    icon={<CheckCircle />} 
                    colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                />
                <Widget 
                    title="Загальний дохід" 
                    value={`${formattedRevenue} ${currencySymbol}`} 
                    icon={<TrendingUp />} 
                    colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
                />
            </div>

            <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-4 2xl:p-5 border-b border-(--platform-border-color) flex justify-between items-center shrink-0">
                    <h3 className="text-base 2xl:text-lg font-bold text-(--platform-text-primary) m-0 truncate pr-4">Останні замовлення</h3>
                    <button 
                        onClick={onGoToOrders}
                        className="text-xs 2xl:text-sm font-medium text-(--platform-accent) hover:text-(--platform-accent-hover) bg-transparent border-none cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                        Всі замовлення <ArrowRight size={16} className="w-4 h-4 2xl:w-5 2xl:h-5" />
                    </button>
                </div>
                
                {data.recentOrders?.length > 0 ? (
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-200">
                            <thead className="sticky top-0 bg-(--platform-bg) z-10 shadow-[0_1px_0_var(--platform-border-color)]">
                                <tr>
                                    <th className="p-3 2xl:p-4 text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider whitespace-nowrap w-[15%]">ID</th>
                                    <th className="p-3 2xl:p-4 text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider w-[35%]">Покупець</th>
                                    <th className="p-3 2xl:p-4 text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider whitespace-nowrap w-[20%]">Сума</th>
                                    <th className="p-3 2xl:p-4 text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider whitespace-nowrap w-[15%]">Дата</th>
                                    <th className="p-3 2xl:p-4 text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider whitespace-nowrap text-right w-[15%]">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentOrders.map((order) => {
                                    const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                    const Icon = st.icon;
                                    return (
                                        <tr key={order.id} className="border-b border-(--platform-border-color) hover:bg-(--platform-hover-bg) transition-colors">
                                            <td className="p-3 2xl:p-4 font-mono text-xs 2xl:text-sm text-(--platform-text-secondary) whitespace-nowrap">
                                                {order.id.slice(0, 8)}...
                                            </td>
                                            <td className="p-3 2xl:p-4 text-sm font-medium text-(--platform-text-primary) max-w-50 truncate" title={order.customer_name}>
                                                {order.customer_name}
                                            </td>
                                            <td className="p-3 2xl:p-4 text-sm font-bold text-(--platform-text-primary) whitespace-nowrap">
                                                {Number(order.total_amount).toFixed(2)} <span className="text-xs opacity-70 font-normal ml-0.5">{data.currency}</span>
                                            </td>
                                            <td className="p-3 2xl:p-4 text-xs 2xl:text-sm text-(--platform-text-secondary) whitespace-nowrap">
                                                {new Date(order.created_at).toLocaleDateString('uk-UA')}
                                            </td>
                                            <td className="p-3 2xl:p-4 text-right whitespace-nowrap">
                                                <span 
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.7rem] 2xl:text-xs font-semibold"
                                                    style={{ backgroundColor: st.bg, color: st.color }}
                                                >
                                                    <Icon size={12} className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" /> {st.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-(--platform-text-secondary) gap-3">
                        <Package size={48} className="opacity-20 mb-2" />
                        <p className="m-0 text-sm 2xl:text-base">У вас ще немає замовлень.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsTab;