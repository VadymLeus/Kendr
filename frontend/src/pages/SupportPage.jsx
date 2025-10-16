// frontend/src/pages/SupportPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SupportPage = () => {
    return (
        <div style={{ maxWidth: '800px', margin: 'auto' }}>
            <h1>Центр підтримки</h1>
            <p>Перш ніж створювати звернення, будь ласка, ознайомтеся з найчастішими питаннями.</p>

            <div style={{ marginBottom: '2rem' }}>
                <h3>Як змінити назву мого сайту?</h3>
                <p>Перейдіть на сторінку вашого сайту, натисніть на іконку шестірні у правому верхньому куті, щоб потрапити до панелі управління. У вкладці "Загальні" ви можете змінити назву.</p>
            </div>
            <div style={{ marginBottom: '2rem' }}>
                <h3>Чи можу я змінити шаблон після створення сайту?</h3>
                <p>На даний момент ця функція не реалізована. Вам потрібно буде створити новий сайт з бажаним шаблоном.</p>
            </div>
            
            <hr />

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h3>Не знайшли відповідь?</h3>
                <p>Створіть звернення, і наша команда підтримки допоможе вам.</p>
                <Link to="/support/new-ticket">
                    <button style={{ padding: '12px 24px', fontSize: '1rem' }}>Створити звернення</button>
                </Link>
                <br/>
                <Link to="/support/my-tickets" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Переглянути мої звернення
                </Link>
            </div>
        </div>
    );
};

export default SupportPage;