// frontend/src/modules/support/AppealPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../shared/api/api';
import { Button } from '../../shared/ui/elements/Button';
import LoadingState from '../../shared/ui/complex/LoadingState';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, Gavel, Clock, XCircle, Check, ExternalLink, ShieldCheck, Lock, Ban } from 'lucide-react';

const AppealPage = () => {
    const [suspendedSites, setSuspendedSites] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        apiClient.get('/sites/my-suspended')
            .then(response => {
                setSuspendedSites(response.data);
            })
            .catch(err => {
                console.error("Помилка отримання заблокованих сайтів:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const getAppealStatusBadge = (appealStatus, ticketStatus) => {
        if (ticketStatus === 'closed' && appealStatus !== 'approved') {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[color-mix(in_srgb,var(--platform-text-secondary),transparent_85%)] text-(--platform-text-secondary) border border-[color-mix(in_srgb,var(--platform-text-secondary),transparent_70%)]">
                    <Lock size={14} className="sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">Тікет закрито</span>
                </div>
            );
        }
        switch (appealStatus) {
            case 'pending':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[color-mix(in_srgb,var(--platform-warning),transparent_85%)] text-(--platform-warning) border border-[color-mix(in_srgb,var(--platform-warning),transparent_70%)]">
                        <Clock size={14} className="sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate">На розгляді</span>
                    </div>
                );
            case 'approved':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[color-mix(in_srgb,var(--platform-success),transparent_85%)] text-(--platform-success) border border-[color-mix(in_srgb,var(--platform-success),transparent_70%)]">
                        <Check size={14} className="sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate">Схвалено</span>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[color-mix(in_srgb,var(--platform-danger),transparent_85%)] text-(--platform-danger) border border-[color-mix(in_srgb,var(--platform-danger),transparent_70%)]">
                        <XCircle size={14} className="sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate">Відхилено</span>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) return <LoadingState />;
    if (suspendedSites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4 sm:p-6 w-full animate-in fade-in duration-300">
                <Helmet>
                    <title>Оскарження блокування | Kendr</title>
                </Helmet>
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[color-mix(in_srgb,var(--platform-success),transparent_90%)] rounded-full flex items-center justify-center mb-5 sm:mb-6 shadow-sm">
                    <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-(--platform-success)" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-(--platform-text-primary) mb-2 sm:mb-3 m-0">
                    Усе чудово!
                </h2>
                <p className="text-(--platform-text-secondary) text-sm sm:text-base md:text-lg max-w-md mb-6 sm:mb-8 m-0 leading-relaxed px-4">
                    У вас немає заблокованих сайтів. Ви дотримуєтесь усіх правил нашої платформи, так тримати!
                </p>
                <Link to="/support" className="no-underline w-full sm:w-auto px-4">
                    <Button variant="primary" className="w-full sm:w-auto min-h-11">Повернутися до панелі</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full h-full flex flex-col">
            <Helmet>
                <title>Оскарження блокування | Kendr</title>
            </Helmet>
            <div className="mb-6 sm:mb-8 shrink-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-(--platform-text-primary) flex items-center gap-2.5 sm:gap-3 m-0">
                    <Gavel className="w-7 h-7 sm:w-8 sm:h-8 text-(--platform-danger) shrink-0" />
                    Оскарження блокування
                </h1>
                <p className="text-(--platform-text-secondary) text-sm sm:text-base md:text-lg m-0 mt-1 sm:mt-2">
                    Тут показані ваші сайти, які були призупинені адміністрацією через порушення правил.
                </p>
            </div>
            <div className="flex flex-col gap-5 sm:gap-6">
                {suspendedSites.map(site => {
                    const siteReason = site.suspension_reason || site.reason;
                    return (
                        <div key={site.id} className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 transition-shadow hover:shadow-md">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                <div className="w-full">
                                    <h4 className="m-0 mb-1.5 text-(--platform-text-primary) text-lg sm:text-xl font-bold flex items-center flex-wrap gap-2 sm:gap-3 w-full">
                                        <span className="truncate max-w-full">{site.title}</span>
                                        <span className="px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[color-mix(in_srgb,var(--platform-danger),transparent_90%)] text-(--platform-danger) border border-[color-mix(in_srgb,var(--platform-danger),transparent_80%)] shrink-0">
                                            Заблоковано
                                        </span>
                                    </h4>
                                    <p className="text-(--platform-text-secondary) m-0 text-xs sm:text-sm mt-2 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                                        <span>Адреса:</span>
                                        <span className="text-(--platform-text-primary) font-medium bg-(--platform-bg) px-2 py-1 rounded border border-(--platform-border-color) break-all">
                                            {site.site_path}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            {siteReason && (
                                <div className="bg-[color-mix(in_srgb,var(--platform-danger),transparent_90%)] text-[color-mix(in_srgb,var(--platform-danger),black_20%)] dark:text-[color-mix(in_srgb,var(--platform-danger),white_20%)] p-3 sm:p-4 rounded-lg text-xs sm:text-sm flex items-start gap-2.5 sm:gap-3 border border-[color-mix(in_srgb,var(--platform-danger),transparent_80%)]">
                                    <Ban className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-(--platform-danger) mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold mb-0.5 text-(--platform-danger)">Причина блокування</span>
                                        <span className="opacity-90 leading-relaxed">{siteReason}</span>
                                    </div>
                                </div>
                            )}
                            <div className="bg-[color-mix(in_srgb,var(--platform-warning),transparent_90%)] text-[color-mix(in_srgb,var(--platform-warning),black_20%)] dark:text-[color-mix(in_srgb,var(--platform-warning),white_20%)] p-3 sm:p-4 rounded-lg text-xs sm:text-sm flex items-start gap-2.5 sm:gap-3 border border-[color-mix(in_srgb,var(--platform-warning),transparent_80%)]">
                                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-(--platform-warning) mt-0.5" />
                                <div className="flex flex-col">
                                    <span className="font-semibold mb-0.5">Попередження про видалення</span>
                                    <span className="opacity-90 leading-relaxed">
                                        Якщо не оскаржити рішення, сайт буде остаточно видалено: <strong className="font-bold">{new Date(site.deletion_scheduled_for).toLocaleDateString('uk-UA')}</strong>
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-2 pt-4 border-t border-(--platform-border-color)">
                                <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-start">
                                    <span className="text-sm font-medium text-(--platform-text-secondary)">Статус апеляції:</span>
                                    {site.appeal_status ? getAppealStatusBadge(site.appeal_status, site.ticket_status) : <span className="text-sm font-medium text-(--platform-text-primary)">Не подано</span>}
                                </div>
                                <div className="w-full sm:w-auto flex">
                                    {site.appeal_status ? (
                                        <Link to={site.ticket_id ? `/support/ticket/${site.ticket_id}` : "/support"} className="no-underline w-full sm:w-auto">
                                            <Button variant="secondary" icon={<ExternalLink size={16} />} className="w-full sm:w-auto min-h-11 sm:min-h-10">
                                                Переглянути тікет
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link to="/support/new-ticket" state={{ site: site }} className="no-underline w-full sm:w-auto">
                                            <Button variant="primary" icon={<Gavel size={16} />} className="w-full sm:w-auto min-h-11 sm:min-h-10 bg-(--platform-danger) hover:bg-red-600 text-white border-none">
                                                Подати апеляцію
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AppealPage;