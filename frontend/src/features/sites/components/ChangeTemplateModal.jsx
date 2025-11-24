import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

const ChangeTemplateModal = ({ isOpen, onClose, onSelect }) => {
    const [activeTab, setActiveTab] = useState('gallery');
    const [templates, setTemplates] = useState([]);
    const [personalTemplates, setPersonalTemplates] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            Promise.all([
                apiClient.get('/sites/templates'),
                apiClient.get('/templates/personal')
            ]).then(([sysRes, persRes]) => {
                setTemplates(sysRes.data);
                setPersonalTemplates(persRes.data);
            }).catch(console.error)
              .finally(() => setLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const currentList = activeTab === 'gallery' ? templates : personalTemplates;

    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)', zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(5px)'
    };
    
    const contentStyle = {
        background: 'var(--platform-bg)', 
        width: '90%', maxWidth: '1000px', height: '85vh',
        borderRadius: '16px', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
    };

    const headerStyle = {
        padding: '1.5rem',
        borderBottom: '1px solid var(--platform-border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--platform-card-bg)', borderRadius: '16px 16px 0 0'
    };

    const tabBtnStyle = (isActive) => ({
        padding: '0.5rem 1rem',
        border: 'none',
        background: 'transparent',
        borderBottom: isActive ? '2px solid var(--platform-accent)' : '2px solid transparent',
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        fontWeight: isActive ? 'bold' : 'normal',
        cursor: 'pointer',
        fontSize: '1rem'
    });

    const gridStyle = {
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px', 
        padding: '2rem',
        overflowY: 'auto',
        flex: 1
    };

    const cardStyle = {
        background: 'var(--platform-card-bg)',
        border: '1px solid var(--platform-border-color)',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex', flexDirection: 'column'
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div>
                        <h2 style={{margin: 0, color: 'var(--platform-text-primary)'}}>Зміна Шаблону</h2>
                        <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--platform-text-secondary)'}}>
                            Оберіть новий дизайн. Поточний контент буде замінено.
                        </p>
                    </div>
                    <button onClick={onClose} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color: 'var(--platform-text-secondary)'}}>✕</button>
                </div>

                <div style={{display: 'flex', gap: '10px', padding: '0 1.5rem', borderBottom: '1px solid var(--platform-border-color)', background: 'var(--platform-card-bg)'}}>
                    <button style={tabBtnStyle(activeTab === 'gallery')} onClick={() => setActiveTab('gallery')}>🏛️ Галерея</button>
                    <button style={tabBtnStyle(activeTab === 'personal')} onClick={() => setActiveTab('personal')}>👤 Мої Шаблони</button>
                </div>

                <div style={gridStyle}>
                    {loading ? (
                        <div style={{textAlign: 'center', gridColumn: '1/-1', padding: '2rem'}}>Завантаження...</div>
                    ) : currentList.length === 0 ? (
                        <div style={{textAlign: 'center', gridColumn: '1/-1', padding: '2rem', color: 'var(--platform-text-secondary)'}}>Список порожній</div>
                    ) : (
                        currentList.map(template => (
                            <div 
                                key={template.id} 
                                style={cardStyle}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{height: '150px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                                    {template.thumbnail_url ? (
                                        <img src={template.thumbnail_url} alt={template.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                    ) : (
                                        <span style={{fontSize:'3rem'}}>🎨</span>
                                    )}
                                </div>
                                <div style={{padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
                                    <h4 style={{margin: '0 0 0.5rem 0', color: 'var(--platform-text-primary)'}}>{template.name}</h4>
                                    <p style={{margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--platform-text-secondary)', flex: 1}}>
                                        {template.description || 'Без опису'}
                                    </p>
                                    <button 
                                        className="btn btn-primary" 
                                        style={{width: '100%'}}
                                        onClick={() => onSelect(template.id, activeTab === 'personal')}
                                    >
                                        Обрати
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangeTemplateModal;