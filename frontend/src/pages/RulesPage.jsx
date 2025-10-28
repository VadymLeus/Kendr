// frontend/src/pages/RulesPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const RulesPage = () => {
    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: '1.6',
        padding: '2rem 1rem'
    };

    const titleStyle = {
        color: 'var(--platform-text-primary)',
        marginBottom: '0.5rem'
    };

    const subtitleStyle = {
        color: 'var(--platform-text-secondary)',
        marginBottom: '2rem',
        fontSize: '0.9rem'
    };

    const warningStyle = {
        background: '#fffbe6',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #ffe58f',
        marginBottom: '2rem',
        color: 'var(--platform-text-primary)'
    };

    const sectionStyle = {
        marginBottom: '2rem'
    };

    const headingStyle = {
        color: 'var(--platform-text-primary)',
        marginBottom: '1rem'
    };

    const listStyle = {
        color: 'var(--platform-text-primary)',
        paddingLeft: '1.5rem',
        marginBottom: '1rem'
    };

    const paragraphStyle = {
        color: 'var(--platform-text-primary)',
        marginBottom: '1rem'
    };

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>Правила платформи Kendr</h1>
            <p style={subtitleStyle}><em>Дата останнього оновлення: 30 вересня 2025 р.</em></p>
            
            <div style={warningStyle}>
                <p style={{ margin: 0 }}><strong>Важливо:</strong> Незнання правил не звільняє від відповідальності. Створюючи сайт на нашій платформі, ви автоматично погоджуєтеся з наведеними нижче умовами.</p>
            </div>

            <div style={sectionStyle}>
                <h2 style={headingStyle}>1. Заборонений контент</h2>
                <p style={paragraphStyle}>На платформі Kendr категорично заборонено розміщувати:</p>
                <ul style={listStyle}>
                    <li>Матеріали, що порушують законодавство.</li>
                    <li>Контент для дорослих (18+), включно з еротикою та порнографією.</li>
                    <li>Сцени насильства, жорстокості та контент, що закликає до ненависті за будь-якою ознакою.</li>
                    <li>Шахрайські сайти, фінансові піраміди та схеми швидкого збагачення.</li>
                    <li>Продаж заборонених товарів та послуг (зброя, наркотики, підроблені документи тощо).</li>
                    <li>Контент, що порушує авторські права третіх осіб.</li>
                </ul>
            </div>

            <div style={sectionStyle}>
                <h2 style={headingStyle}>2. Відповідальність користувача</h2>
                <p style={paragraphStyle}>Ви несете повну та одноосібну відповідальність за весь контент, розміщений на створеному вами сайті. Адміністрація платформи не несе відповідальності за дії користувачів, але залишає за собою право модерувати контент.</p>
            </div>

            <div style={sectionStyle}>
                <h2 style={headingStyle}>3. Модерація та санкції</h2>
                <p style={paragraphStyle}>Адміністрація має право без попереднього повідомлення:</p>
                <ul style={listStyle}>
                    <li>Тимчасово заблокувати або назавжди видалити сайт, що порушує правила.</li>
                    <li>Заблокувати акаунт користувача за систематичні або грубі порушення.</li>
                </ul>
                <p style={paragraphStyle}>Рішення адміністрації є остаточними та оскарженню не підлягають.</p>
            </div>
            
            <div style={sectionStyle}>
                <h2 style={headingStyle}>4. Використання платформи</h2>
                <p style={paragraphStyle}>Забороняється використовувати платформу для DdoS-атак, розсилки спаму, фішингу та будь-якої іншої шкідливої діяльності, яка може завдати шкоди роботі сервісу або іншим користувачам.</p>
            </div>

            <hr style={{ 
                border: 'none',
                borderTop: '1px solid var(--platform-border-color)',
                margin: '2rem 0' 
            }} />
            
            <div style={{ textAlign: 'center' }}>
                <Link to="/create-site">
                    <button className="btn btn-primary">
                        Я ознайомився(-лась) і погоджуюся з правилами
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default RulesPage;