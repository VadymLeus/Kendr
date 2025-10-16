// frontend/src/admin/AdminSupportPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';

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
        if (status === 'answered') return { color: 'green' };
        if (status === 'open') return { color: 'orange' };
        return {};
    };

    if (loading) return <p>Завантаження активних звернень...</p>;

    return (
        <div>
            <h1>Центр підтримки адміністратора</h1>
            <p>Тут відображаються всі відкриті та ті, на які вже надано відповідь, звернення.</p>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '2rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #4a5568', textAlign: 'left' }}>
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
                                <Link to={`/support/ticket/${ticket.id}`} style={{ color: '#2b6cb0', textDecoration: 'none' }}>
                                    {ticket.subject}
                                </Link>
                            </td>
                            <td style={tdStyle}>{ticket.username}</td>
                            <td style={{ ...tdStyle, ...getStatusStyle(ticket.status), fontWeight: 'bold' }}>
                                {ticket.status === 'open' && 'Відкрито'}
                                {ticket.status === 'answered' && 'Є відповідь'}
                            </td>
                            <td style={tdStyle}>{new Date(ticket.updated_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const thStyle = { padding: '12px 8px' };
const tdStyle = { padding: '12px 8px', borderBottom: '1px solid #e2e8f0' };

export default AdminSupportPage;
