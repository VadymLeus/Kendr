// frontend/src/features/sites/tabs/SubmissionsTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../../services/api';

const SubmissionsTab = ({ siteId }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        apiClient.get(`/form/${siteId}`)
            .then(res => setSubmissions(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [siteId]);

    const handleSelect = (submission) => {
        setSelected(submission);
        if (!submission.is_read) {
            apiClient.put(`/form/${siteId}/${submission.id}/read`)
                .then(() => {
                    setSubmissions(prev => prev.map(s => 
                        s.id === submission.id ? { ...s, is_read: 1 } : s
                    ));
                });
        }
    };

    const handleDelete = async (e, submissionId) => {
        e.stopPropagation(); 
        if (!window.confirm('Ви впевнені, що хочете видалити цю заявку?')) {
            return;
        }

        try {
            await apiClient.delete(`/form/${siteId}/${submissionId}`);
            setSubmissions(prev => prev.filter(s => s.id !== submissionId));
            if (selected && selected.id === submissionId) {
                setSelected(null);
            }
        } catch (err) {
            alert('Помилка видалення заявки.');
        }
    };

    const filteredSubmissions = useMemo(() => {
        if (!searchTerm) {
            return submissions;
        }
        const lowerSearch = searchTerm.toLowerCase();
        return submissions.filter(s => {
            const data = s.form_data; 
            return (
                data.name?.toLowerCase().includes(lowerSearch) ||
                data.email?.toLowerCase().includes(lowerSearch) ||
                data.subject?.toLowerCase().includes(lowerSearch) ||
                data.message?.toLowerCase().includes(lowerSearch)
            );
        });
    }, [submissions, searchTerm]);

    if (loading) return <p>Завантаження заявок...</p>;

    const styles = {
        listColumn: {
            flex: 1,
            minWidth: '300px',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        searchContainer: {
            position: 'relative',
            width: '100%'
        },
        searchInput: {
            width: '100%',
            padding: '0.75rem',
            paddingRight: '2.5rem',
            boxSizing: 'border-box'
        },
        clearButton: {
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--platform-text-secondary)',
            fontSize: '1.2rem'
        }
    };

    return (
        <div>
            {submissions.length === 0 ? (
                <p>Ще немає жодної заявки з форм.</p>
            ) : (
                <div style={{ display: 'flex', gap: '1rem', minHeight: '600px' }}>
                    
                    <div style={styles.listColumn}>
                        
                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Пошук за ім'ям, email або повідомленням..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')} 
                                    style={styles.clearButton}
                                    title="Очистити"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                        
                        <div style={{ maxHeight: '600px', overflowY: 'auto', flex: 1 }}>
                            {filteredSubmissions.length === 0 ? (
                                <p style={{textAlign: 'center', color: 'var(--platform-text-secondary)'}}>Не знайдено заявок за вашим запитом.</p>
                            ) : (
                                filteredSubmissions.map(s => {
                                    const data = s.form_data;
                                    return (
                                        <div 
                                            key={s.id} 
                                            onClick={() => handleSelect(s)} 
                                            style={{ 
                                                padding: '1rem', 
                                                border: selected?.id === s.id ? '2px solid var(--platform-accent)' : '1px solid var(--platform-border-color)', 
                                                borderRadius: '8px', 
                                                marginBottom: '0.5rem', 
                                                cursor: 'pointer', 
                                                background: !s.is_read ? '#f0f9ff' : 'var(--platform-card-bg)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div>
                                                <strong style={{ fontWeight: !s.is_read ? 'bold' : 'normal' }}>
                                                    {data.name} ({data.email})
                                                </strong>
                                                <small style={{ display: 'block', color: 'var(--platform-text-secondary)' }}>
                                                    {new Date(s.created_at).toLocaleString()}
                                                </small>
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(e, s.id)}
                                                title="Видалити заявку"
                                                style={{ background: 'none', border: 'none', color: 'var(--platform-danger)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div style={{ flex: 2, padding: '1rem', background: 'var(--platform-bg)', borderRadius: '8px' }}>
                        {selected ? (
                            <div>
                                <h4>Заявка від: {selected.form_data.name}</h4>
                                <p><strong>Email:</strong> {selected.form_data.email}</p>
                                <p><strong>Тема:</strong> {selected.form_data.subject}</p>
                                <hr />
                                <p style={{ whiteSpace: 'pre-wrap' }}>{selected.form_data.message}</p>
                            </div>
                        ) : (
                            <p style={{textAlign: 'center', color: 'var(--platform-text-secondary)', paddingTop: '4rem'}}>
                                Оберіть заявку зі списку для перегляду.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default SubmissionsTab;