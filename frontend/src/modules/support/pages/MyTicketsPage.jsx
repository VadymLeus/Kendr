// frontend/src/modules/support/pages/MyTicketsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../shared/api/api';
import { Button } from '../../../shared/ui/elements/Button';
import { IconPlus, IconMessageSquare, IconLoader } from '../../../shared/ui/elements/Icons';
import { Helmet } from 'react-helmet-async';

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
        const baseStyle = {
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase'
        };

        switch (status) {
            case 'open':
                return <span style={{ ...baseStyle, background: 'rgba(221, 107, 32, 0.1)', color: 'var(--platform-warning)' }}>Відкрито</span>;
            case 'answered':
                return <span style={{ ...baseStyle, background: 'rgba(56, 161, 105, 0.1)', color: 'var(--platform-success)' }}>Є відповідь</span>;
            case 'closed':
                return <span style={{ ...baseStyle, background: 'var(--platform-bg)', color: 'var(--platform-text-secondary)', border: '1px solid var(--platform-border-color)' }}>Закрито</span>;
            default:
                return null;
        }
    };

    const containerStyle = {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
    };

    const ticketLinkStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '12px',
        textDecoration: 'none',
        color: 'inherit',
        background: 'var(--platform-card-bg)',
        transition: 'all 0.2s ease',
        marginBottom: '1rem'
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <IconLoader size={32} className="animate-spin" style={{ color: 'var(--platform-accent)' }} />
        </div>
    );
    
    if (error) return (
        <div style={{ 
            color: 'var(--platform-danger)', 
            background: '#fff2f0',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            margin: '2rem',
            border: '1px solid #ffccc7'
        }}>
            {error}
        </div>
    );

    return (
        <div style={containerStyle}>
            <Helmet>
                <title>Мої звернення | Kendr</title>
            </Helmet>

            <div style={headerStyle}>
                <div>
                    <h1 style={{ color: 'var(--platform-text-primary)', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                        Мої звернення
                    </h1>
                    <p style={{ color: 'var(--platform-text-secondary)', margin: 0 }}>
                        Історія вашої комунікації з підтримкою
                    </p>
                </div>
                <Link to="/support/new-ticket" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" icon={<IconPlus size={18}/>}>
                        Нове звернення
                    </Button>
                </Link>
            </div>
            
            {tickets.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '4rem 2rem',
                    background: 'var(--platform-card-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--platform-border-color)'
                }}>
                    <div style={{ color: 'var(--platform-text-secondary)', marginBottom: '1.5rem' }}>
                        <IconMessageSquare size={48} />
                    </div>
                    <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>
                        У вас ще немає звернень
                    </h3>
                    <p style={{ color: 'var(--platform-text-secondary)', marginBottom: '2rem' }}>
                        Якщо у вас виникли питання або проблеми, створіть тікет.
                    </p>
                    <Link to="/support/new-ticket" style={{ textDecoration: 'none' }}>
                        <Button variant="primary">
                            Створити перше звернення
                        </Button>
                    </Link>
                </div>
            ) : (
                <div>
                    {tickets.map(ticket => (
                        <Link 
                            to={`/support/ticket/${ticket.id}`} 
                            key={ticket.id} 
                            style={ticketLinkStyle}
                            className="hover-card-effect"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                                e.currentTarget.style.borderColor = 'var(--platform-accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'var(--platform-border-color)';
                            }}
                        >
                            <div>
                                <h3 style={{ 
                                    margin: '0 0 0.5rem 0', 
                                    color: 'var(--platform-text-primary)',
                                    fontSize: '1.1rem'
                                }}>
                                    {ticket.subject}
                                </h3>
                                <small style={{ color: 'var(--platform-text-secondary)' }}>
                                    Створено: {new Date(ticket.created_at).toLocaleString()}
                                </small>
                            </div>
                            <div>
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