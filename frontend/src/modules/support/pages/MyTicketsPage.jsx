// frontend/src/modules/support/pages/MyTicketsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import { Button } from '../../../shared/ui/elements/Button';
import { Helmet } from 'react-helmet-async';
import { Plus, MessageSquare, Loader, Gavel, FileText } from 'lucide-react';

const MyTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await apiClient.get('/support/my-tickets');
                setTickets(response.data);
            } catch (err) {
                setError('Не вдалося завантажити ваші звернення.');
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const getStatusBadge = (status) => {
        const baseClass = "px-3 py-1 rounded-full text-xs font-bold uppercase border border-transparent";
        switch (status) {
            case 'open':
                return <span className={baseClass} style={{ background: 'color-mix(in srgb, var(--platform-warning), transparent 90%)', color: 'var(--platform-warning)' }}>Відкрито</span>;
            case 'answered':
                return <span className={baseClass} style={{ background: 'color-mix(in srgb, var(--platform-success), transparent 90%)', color: 'var(--platform-success)' }}>Є відповідь</span>;
            case 'closed':
                return <span className={`${baseClass} bg-(--platform-bg) text-(--platform-text-secondary) border-(--platform-border-color)!`}>Закрито</span>;
            default:
                return null;
        }
    };

    const getTypeBadge = (type) => {
        const baseClass = "px-2 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1.5 mr-2";
        if (type === 'appeal') {
            return (
                <span className={baseClass} style={{ background: 'color-mix(in srgb, var(--platform-danger), transparent 90%)', color: 'var(--platform-danger)' }}>
                    <Gavel size={12} /> Апеляція
                </span>
            );
        }
        return (
            <span className={baseClass} style={{ background: 'color-mix(in srgb, var(--platform-accent), transparent 90%)', color: 'var(--platform-accent)' }}>
                <FileText size={12} /> Загальне
            </span>
        );
    };
    if (loading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader size={32} className="animate-spin text-(--platform-accent)" />
        </div>
    );
    if (error) return (
        <div className="m-8 p-4 text-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-500">
            {error}
        </div>
    );
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full h-full flex flex-col">
            <Helmet>
                <title>Мої звернення | Kendr</title>
            </Helmet>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 text-(--platform-text-primary) m-0">
                        Мої звернення
                    </h1>
                    <p className="text-(--platform-text-secondary) text-base md:text-lg m-0">
                        Історія вашої комунікації з підтримкою
                    </p>
                </div>
                <Link to="/support/new-ticket" className="no-underline">
                    <Button variant="primary" icon={<Plus size={18}/>}>
                        Нове звернення
                    </Button>
                </Link>
            </div>
            {tickets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="w-20 h-20 bg-(--platform-accent)/10 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare size={36} className="text-(--platform-accent)" />
                    </div>
                    <h3 className="text-xl font-semibold text-(--platform-text-primary) mb-2 m-0">
                        У вас ще немає звернень
                    </h3>
                    <p className="text-(--platform-text-secondary) mb-6 max-w-md m-0">
                        Якщо у вас виникли питання або проблеми, створіть тікет.
                    </p>
                    <Link to="/support/new-ticket" className="no-underline">
                        <Button variant="primary">
                            Створити перше звернення
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {tickets.map(ticket => (
                        <Link 
                            to={`/support/ticket/${ticket.id}`} 
                            key={ticket.id} 
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 md:p-6 border border-(--platform-border-color) rounded-xl no-underline text-inherit bg-(--platform-card-bg) transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-(--platform-accent) gap-4"
                        >
                            <div>
                                <div className="mb-2">
                                    {getTypeBadge(ticket.type)}
                                </div>
                                <h3 className="m-0 mb-1 text-(--platform-text-primary) text-lg font-semibold">
                                    {ticket.subject}
                                </h3>
                                <p className="text-sm text-(--platform-text-secondary) m-0">
                                    Створено: {new Date(ticket.created_at).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                </p>
                            </div>
                            <div className="shrink-0">
                                {getStatusBadge(ticket.status)}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTicketsPage;