// frontend/src/features/support/MyTicketsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';

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
                return { color: '#dd6b20', fontWeight: 'bold' }; // Orange
            case 'answered':
                return { color: '#38a169', fontWeight: 'bold' }; // Green
            case 'closed':
                return { color: '#718096', fontWeight: 'bold' }; // Gray
            default:
                return {};
        }
    };

    if (loading) return <div>Завантаження звернень...</div>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ maxWidth: '900px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Мої звернення</h1>
                <Link to="/support/new-ticket">
                    <button>Створити нове звернення</button>
                </Link>
            </div>
            
            {tickets.length === 0 ? (
                <p>У вас ще немає звернень до підтримки.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                    {tickets.map(ticket => (
                        <Link to={`/support/ticket/${ticket.id}`} key={ticket.id} style={ticketLinkStyle}>
                            <div>
                                <h3 style={{ margin: 0, color: '#2d3748' }}>{ticket.subject}</h3>
                                <small style={{ color: '#718096' }}>
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

const ticketLinkStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'inherit',
    background: 'white',
    transition: 'box-shadow 0.2s, transform 0.2s',
};

export default MyTicketsPage;