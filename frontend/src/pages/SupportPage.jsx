// frontend/src/pages/SupportPage.jsx
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
        border: '1px solid var(--platform-border-color)'
    };

    const centerSectionStyle = {
        ...sectionStyle,
        textAlign: 'center'
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>
                Центр підтримки
            </h1>
            <p style={{ 
                color: 'var(--platform-text-secondary)',
                marginBottom: '2rem'
            }}>
                Перш ніж створювати звернення, будь ласка, ознайомтеся з найчастішими питаннями.
            </p>

            <div style={sectionStyle}>
                <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>
                    Як змінити назву мого сайту?
                </h3>
                <p style={{ 
                    color: 'var(--platform-text-secondary)',
                    margin: 0,
                    lineHeight: '1.6'
                }}>
                    Перейдіть на сторінку вашого сайту, натисніть на іконку шестірні у правому верхньому куті, щоб потрапити до панелі управління. У вкладці "Загальні" ви можете змінити назву.
                </p>
            </div>

            <div style={sectionStyle}>
                <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '0.5rem' }}>
                    Чи можу я змінити шаблон після створення сайту?
                </h3>
                <p style={{ 
                    color: 'var(--platform-text-secondary)',
                    margin: 0,
                    lineHeight: '1.6'
                }}>
                    На даний момент ця функція не реалізована. Вам потрібно буде створити новий сайт з бажаним шаблоном.
                </p>
            </div>
            
            <hr style={{ 
                border: 'none',
                borderTop: '1px solid var(--platform-border-color)',
                margin: '2rem 0'
            }} />

            <div style={centerSectionStyle}>
                <h3 style={{ color: 'var(--platform-text-primary)', marginBottom: '1rem' }}>
                    Не знайшли відповідь?
                </h3>
                <p style={{ 
                    color: 'var(--platform-text-secondary)',
                    marginBottom: '1.5rem'
                }}>
                    Створіть звернення, і наша команда підтримки допоможе вам.
                </p>
                <Link to="/support/new-ticket">
                    <button className="btn btn-primary" style={{ marginBottom: '1rem' }}>
                        Створити звернення
                    </button>
                </Link>
                <br/>
                <Link 
                    to="/support/appeal" 
                    style={{ 
                        color: 'var(--platform-accent)',
                        textDecoration: 'none',
                        display: 'inline-block',
                        margin: '0.5rem 0'
                    }}
                >
                    Оскаржити блокування
                </Link>
                <br/>
                <Link 
                    to="/support/my-tickets" 
                    style={{ 
                        color: 'var(--platform-accent)',
                        textDecoration: 'none',
                        display: 'inline-block',
                        margin: '0.5rem 0'
                    }}
                >
                    Переглянути мої звернення
                </Link>
            </div>
        </div>
    );
};

export default SupportPage;