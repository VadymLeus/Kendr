// frontend/src/modules/admin/pages/AdminSupportPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../common/services/api';

const AdminSupportPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await apiClient.get('/support/admin/open');
                setTickets(response.data);
            } catch (err) {
                console.error("Не вдалося завантажити звернення:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const getStatusStyle = (status) => {
        if (status === 'answered') return { color: 'var(--platform-success)' };
        if (status === 'open') return { color: 'var(--platform-warning)' };
        return {};
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        background: 'var(--platform-card-bg)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        marginTop: '2rem'
    };

    const thStyle = { 
        padding: '1rem', 
        textAlign: 'left',
        background: 'var(--platform-sidebar-bg)',
        color: 'var(--platform-accent-text)',
        fontWeight: '600',
        borderBottom: '1px solid var(--platform-border-color)'
    };

    const tdStyle = { 
        padding: '1rem', 
        borderBottom: '1px solid var(--platform-border-color)',
        color: 'var(--platform-text-primary)'
    };

    if (loading) return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--platform-text-secondary)' 
        }}>
            Завантаження активних звернень...
        </div>
    );

    return (
        <div style={containerStyle}>
            <h1 style={{ 
                color: 'var(--platform-text-primary)', 
                marginBottom: '0.5rem' 
            }}>
                Центр підтримки адміністратора
            </h1>
            <p style={{ 
                color: 'var(--platform-text-secondary)',
                marginBottom: '1.5rem'
            }}>
                Тут відображаються всі відкриті та ті, на які вже надано відповідь, звернення.
            </p>
            
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Тема</th>
                        <th style={thStyle}>Користувач</th>
                        <th style={thStyle}>Статус</th>
                        <th style={thStyle}>Останнє оновлення</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map(ticket => (
                        <tr key={ticket.id}>
                            <td style={tdStyle}>
                                <Link 
                                    to={`/support/ticket/${ticket.id}`} 
                                    style={{ 
                                        color: 'var(--platform-accent)', 
                                        textDecoration: 'none',
                                        fontWeight: '500'
                                    }}
                                >
                                    {ticket.subject}
                                </Link>
                            </td>
                            <td style={tdStyle}>{ticket.username}</td>
                            <td style={{ 
                                ...tdStyle, 
                                ...getStatusStyle(ticket.status), 
                                fontWeight: 'bold' 
                            }}>
                                {ticket.status === 'open' && 'Відкрито'}
                                {ticket.status === 'answered' && 'Є відповідь'}
                            </td>
                            <td style={tdStyle}>
                                {new Date(ticket.updated_at).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminSupportPage;