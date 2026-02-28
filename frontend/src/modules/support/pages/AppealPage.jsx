// frontend/src/modules/support/pages/AppealPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import { Button } from '../../../shared/ui/elements/Button';
import LoadingState from '../../../shared/ui/complex/LoadingState';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, Gavel, CheckCircle, Clock, XCircle, Check } from 'lucide-react';

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

    const getAppealStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <Button 
                        variant="secondary" 
                        disabled 
                        icon={<Clock size={18}/>} 
                        style={{
                            opacity: 1, 
                            background: 'color-mix(in srgb, var(--platform-warning), transparent 90%)', 
                            color: 'var(--platform-warning)', 
                            borderColor: 'var(--platform-warning)'
                        }}
                    >
                        На розгляді
                    </Button>
                );
            case 'approved':
                return (
                    <Button 
                        variant="secondary" 
                        disabled 
                        icon={<Check size={18}/>} 
                        style={{
                            opacity: 1, 
                            background: 'color-mix(in srgb, var(--platform-success), transparent 90%)', 
                            color: 'var(--platform-success)', 
                            borderColor: 'var(--platform-success)'
                        }}
                    >
                        Схвалено
                    </Button>
                );
            case 'rejected':
                return (
                    <Button 
                        variant="secondary" 
                        disabled 
                        icon={<XCircle size={18}/>} 
                        style={{
                            opacity: 1, 
                            background: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', 
                            color: 'var(--platform-danger)', 
                            borderColor: 'var(--platform-danger)'
                        }}
                    >
                        Відхилено
                    </Button>
                );
            default:
                return null;
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full h-full flex flex-col">
            <Helmet>
                <title>Оскарження блокування | Kendr</title>
            </Helmet>
            <div className="mb-8 shrink-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-(--platform-text-primary) flex items-center gap-3 m-0">
                    <Gavel size={32} className="text-(--platform-danger)" />
                    Оскарження блокування
                </h1>
                <p className="text-(--platform-text-secondary) text-base md:text-lg m-0">
                    Тут показані ваші сайти, які були призупинені адміністрацією через порушення правил.
                </p>
            </div>
            {suspendedSites.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="w-20 h-20 bg-(--platform-accent)/10 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={36} className="text-(--platform-accent)" />
                    </div>
                    <h3 className="text-xl font-semibold text-(--platform-text-primary) mb-2 m-0">
                        У вас немає призупинених сайтів
                    </h3>
                    <p className="text-(--platform-text-secondary) max-w-md m-0">
                        Це чудово! Ви дотримуєтесь правил платформи.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {suspendedSites.map(site => (
                        <div key={site.id} className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl p-6 shadow-sm flex flex-col gap-4">
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div>
                                    <h4 className="m-0 mb-2 text-(--platform-text-primary) text-xl font-semibold">
                                        {site.title}
                                    </h4>
                                    <p className="text-(--platform-text-secondary) m-0 text-sm">
                                        Адреса: <strong>{site.site_path}</strong>
                                    </p>
                                </div>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    className="cursor-default opacity-100 pointer-events-none"
                                >
                                    Suspended
                                </Button>
                            </div>
                            <div className="bg-orange-500/10 text-orange-600 dark:text-orange-500 p-3 rounded-lg text-sm flex items-center gap-2 border border-orange-500/20">
                                <AlertTriangle size={20} className="shrink-0" />
                                <span>
                                    Заплановане видалення: <strong>{new Date(site.deletion_scheduled_for).toLocaleDateString()}</strong>
                                </span>
                            </div>
                            <div className="flex justify-end mt-2">
                                {site.appeal_status ? (
                                    getAppealStatusBadge(site.appeal_status)
                                ) : (
                                    <Link to="/support/new-ticket" state={{ site: site }} className="no-underline">
                                        <Button variant="primary">
                                            Подати апеляцію
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppealPage;