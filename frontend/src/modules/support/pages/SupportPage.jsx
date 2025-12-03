// frontend/src/modules/support/pages/SupportPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SupportPage = () => {
    const containerStyle = {
        maxWidth: '800px',
        margin: 'auto',
        padding: '2rem 1rem'
    };

    const sectionStyle = {
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--platform-card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    };

    const centerSectionStyle = {
        ...sectionStyle,
        textAlign: 'center'
    };

    const faqItems = [
        {
            question: "Як змінити назву мого сайту?",
            answer: "Перейдіть на сторінку вашого сайту, натисніть на іконку шестірні у правому верхньому куті, щоб потрапити до панелі управління. У вкладці 'Загальні' ви можете змінити назву."
        },
        {
            question: "Чи можу я змінити шаблон після створення сайту?",
            answer: "На даний момент ця функція не реалізована. Вам потрібно буде створити новий сайт з бажаним шаблоном."
        },
        {
            question: "Як додати товари до мого магазину?",
            answer: "У панелі управління сайтом перейдіть у вкладку 'Магазин', де ви можете додавати товари, керувати категоріями та налаштовувати параметри магазину."
        },
        {
            question: "Чому мій сайт не відображається публічно?",
            answer: "Перевірте статус сайту у вкладці 'Загальні' налаштувань. Сайт має бути опублікованим, щоб бути видимим для інших користувачів."
        }
    ];

    return (
        <div style={containerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1rem',
                    fontSize: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    🛠️ Центр підтримки
                </h1>
                <p style={{ 
                    color: 'var(--platform-text-secondary)',
                    marginBottom: '2rem',
                    fontSize: '1.1rem',
                    maxWidth: '600px',
                    margin: '0 auto 2rem auto'
                }}>
                    Перш ніж створювати звернення, будь ласка, ознайомтеся з найчастішими питаннями.
                </p>
            </div>

            <div style={sectionStyle}>
                <h2 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    ❓ Часті запитання (FAQ)
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {faqItems.map((item, index) => (
                        <div key={index} style={{
                            padding: '1rem',
                            background: 'var(--platform-bg)',
                            borderRadius: '8px',
                            border: '1px solid var(--platform-border-color)'
                        }}>
                            <h3 style={{ 
                                color: 'var(--platform-text-primary)', 
                                marginBottom: '0.5rem',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{ color: 'var(--platform-accent)' }}>•</span>
                                {item.question}
                            </h3>
                            <p style={{ 
                                color: 'var(--platform-text-secondary)',
                                margin: 0,
                                lineHeight: '1.6',
                                fontSize: '0.95rem'
                            }}>
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            
            <hr style={{ 
                border: 'none',
                borderTop: '1px solid var(--platform-border-color)',
                margin: '2rem 0'
            }} />

            <div style={centerSectionStyle}>
                <h3 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    💬 Не знайшли відповідь?
                </h3>
                <p style={{ 
                    color: 'var(--platform-text-secondary)',
                    marginBottom: '1.5rem',
                    fontSize: '1rem'
                }}>
                    Створіть звернення, і наша команда підтримки допоможе вам.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/support/new-ticket" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary" style={{ 
                            padding: '12px 24px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            📩 Створити звернення
                        </button>
                    </Link>
                    
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link 
                            to="/support/appeal" 
                            style={{ 
                                color: 'var(--platform-accent)',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '8px 16px',
                                border: '1px solid var(--platform-border-color)',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'var(--platform-bg)';
                                e.target.style.borderColor = 'var(--platform-accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.borderColor = 'var(--platform-border-color)';
                            }}
                        >
                            ⚖️ Оскаржити блокування
                        </Link>
                        <Link 
                            to="/support/my-tickets" 
                            style={{ 
                                color: 'var(--platform-accent)',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '8px 16px',
                                border: '1px solid var(--platform-border-color)',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'var(--platform-bg)';
                                e.target.style.borderColor = 'var(--platform-accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.borderColor = 'var(--platform-border-color)';
                            }}
                        >
                            📋 Мої звернення
                        </Link>
                    </div>
                </div>
            </div>

            <div style={{ 
                ...sectionStyle, 
                background: 'rgba(56, 161, 105, 0.05)',
                border: '1px solid rgba(56, 161, 105, 0.2)'
            }}>
                <h4 style={{ 
                    color: 'var(--platform-success)', 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    💡 Порада
                </h4>
                <p style={{ 
                    color: 'var(--platform-text-secondary)',
                    margin: 0,
                    fontSize: '0.9rem'
                }}>
                    Описуйте свою проблему максимально детально - це допоможе нам швидше її вирішити. Додавайте скріншоти та конкретні приклади.
                </p>
            </div>
        </div>
    );
};

export default SupportPage;