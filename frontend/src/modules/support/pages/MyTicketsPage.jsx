// frontend/src/modules/support/pages/MyTicketsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../common/services/api';

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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'open':
                return { color: 'var(--platform-warning)', fontWeight: 'bold' };
            case 'answered':
                return { color: 'var(--platform-success)', fontWeight: 'bold' };
            case 'closed':
                return { color: 'var(--platform-text-secondary)', fontWeight: 'bold' };
            default:
                return {};
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
        marginBottom: '2rem'
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    };

    const ticketLinkHoverStyle = {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
    };

    if (loading) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--platform-text-secondary)' 
        }}>
            Завантаження звернень...
        </div>
    );
    
    if (error) return (
        <div style={{ 
            color: 'var(--platform-danger)', 
            background: '#fff2f0',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            margin: '2rem'
        }}>
            {error}
        </div>
    );

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={{ color: 'var(--platform-text-primary)', margin: 0 }}>
                    Мої звернення
                </h1>
                <Link to="/support/new-ticket">
                    <button className="btn btn-primary">
                        Створити нове звернення
                    </button>
                </Link>
            </div>
            
            {tickets.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    background: 'var(--platform-card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--platform-border-color)'
                }}>
                    <p style={{ 
                        color: 'var(--platform-text-secondary)',
                        marginBottom: '1.5rem'
                    }}>
                        У вас ще немає звернень до підтримки.
                    </p>
                    <Link to="/support/new-ticket">
                        <button className="btn btn-primary">
                            Створити перше звернення
                        </button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tickets.map(ticket => (
                        <Link 
                            to={`/support/ticket/${ticket.id}`} 
                            key={ticket.id} 
                            style={ticketLinkStyle}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, ticketLinkHoverStyle)}
                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, ticketLinkStyle)}
                        >
                            <div>
                                <h3 style={{ 
                                    margin: '0 0 0.5rem 0', 
                                    color: 'var(--platform-text-primary)' 
                                }}>
                                    {ticket.subject}
                                </h3>
                                <small style={{ 
                                    color: 'var(--platform-text-secondary)',
                                    fontSize: '0.9rem'
                                }}>
                                    Створено: {new Date(ticket.created_at).toLocaleString()}
                                </small>
                            </div>
                            <span style={getStatusStyle(ticket.status)}>
                                {ticket.status === 'open' && 'Відкрито'}
                                {ticket.status === 'answered' && 'Є відповідь'}
                                {ticket.status === 'closed' && 'Закрито'}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTicketsPage;