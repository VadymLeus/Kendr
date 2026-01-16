// frontend/src/modules/support/pages/SupportPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/ui/elements/Button';
import { Helmet } from 'react-helmet-async';
import { HelpCircle, MessageCircle, Gavel, ChevronRight, Plus } from 'lucide-react';

const SupportPage = () => {
    const containerStyle = {
        maxWidth: '1000px',
        margin: 'auto',
        padding: '3rem 1.5rem'
    };

    const sectionStyle = {
        marginBottom: '2.5rem',
        padding: '2rem',
        background: 'var(--platform-card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
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
            <Helmet>
                <title>Центр підтримки | Kendr</title>
            </Helmet>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1rem',
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                }}>
                    <HelpCircle size={40} style={{ color: 'var(--platform-accent)' }} />
                    Центр підтримки
                </h1>
                <p style={{ 
                    color: 'var(--platform-text-secondary)',
                    fontSize: '1.2rem',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    Ми тут, щоб допомогти. Знайдіть відповіді на питання або зв'яжіться з нами.
                </p>
            </div>

            <div style={sectionStyle}>
                <h2 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: '700'
                }}>
                    Часті запитання (FAQ)
                </h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {faqItems.map((item, index) => (
                        <div key={index} style={{
                            padding: '1.5rem',
                            background: 'var(--platform-bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--platform-border-color)'
                        }}>
                            <h3 style={{ 
                                color: 'var(--platform-text-primary)', 
                                marginBottom: '0.75rem',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <ChevronRight size={18} style={{ color: 'var(--platform-accent)' }} />
                                {item.question}
                            </h3>
                            <p style={{ 
                                color: 'var(--platform-text-secondary)',
                                margin: 0,
                                lineHeight: '1.6',
                                fontSize: '0.95rem',
                                paddingLeft: '26px'
                            }}>
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div style={{
                background: 'linear-gradient(135deg, var(--platform-card-bg) 0%, var(--platform-bg) 100%)',
                borderRadius: '16px',
                border: '1px solid var(--platform-border-color)',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
            }}>
                <h3 style={{ 
                    color: 'var(--platform-text-primary)', 
                    marginBottom: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: '700'
                }}>
                    Не знайшли відповідь?
                </h3>
                <p style={{ 
                    color: 'var(--platform-text-secondary)', 
                    marginBottom: '2rem', 
                    fontSize: '1.1rem',
                    maxWidth: '500px',
                    margin: '0 auto 2rem auto'
                }}>
                    Створіть звернення, і наша команда підтримки допоможе вам вирішити проблему.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/support/new-ticket" style={{ textDecoration: 'none' }}>
                        <Button variant="primary" size="lg" icon={<Plus size={20}/>}>
                            Створити звернення
                        </Button>
                    </Link>

                    <Link to="/support/my-tickets" style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" size="lg" icon={<MessageCircle size={20}/>}>
                            Мої звернення
                        </Button>
                    </Link>
                    
                    <Link to="/support/appeal" style={{ textDecoration: 'none' }}>
                         <Button variant="outline" size="lg" icon={<Gavel size={20}/>}>
                            Апеляції
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;