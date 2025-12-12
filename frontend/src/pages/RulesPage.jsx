// frontend/src/pages/RulesPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const RulesPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);

const handleAgree = () => {
        const fromSource = searchParams.get('from');

        if (fromSource === 'register') {
            navigate('/register?view=register', { state: { rulesAccepted: true } });
        } else if (fromSource === 'create-site') {
            navigate('/create-site', { state: { rulesAccepted: true } });
        } else {
            navigate('/');
        }
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: '1.6',
        padding: '2rem 1rem'
    };

    const titleStyle = {
        color: 'var(--platform-text-primary)',
        marginBottom: '0.5rem',
        fontSize: '2rem',
        fontWeight: '700',
        textAlign: 'center'
    };

    const subtitleStyle = {
        color: 'var(--platform-text-secondary)',
        marginBottom: '2rem',
        fontSize: '0.95rem',
        textAlign: 'center'
    };

    const sectionStyle = {
        marginBottom: '2.5rem',
        background: 'var(--platform-card-bg)',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    };

    const headingStyle = {
        color: 'var(--platform-text-primary)',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--platform-border-color)',
        paddingBottom: '0.5rem',
        fontSize: '1.5rem'
    };

    const subHeadingStyle = {
        color: 'var(--platform-text-primary)',
        margin: '1.5rem 0 0.5rem 0',
        fontSize: '1.1rem',
        fontWeight: '600'
    };

    const listStyle = {
        color: 'var(--platform-text-primary)',
        paddingLeft: '1.2rem',
        marginBottom: '1rem',
        listStyleType: 'disc'
    };

    const paragraphStyle = {
        color: 'var(--platform-text-primary)',
        marginBottom: '1rem',
        fontSize: '1rem'
    };

    const primaryButtonStyle = {
        padding: '14px 32px',
        background: isPrimaryHovered ? 'var(--platform-accent-hover)' : 'var(--platform-accent)',
        color: 'var(--platform-accent-text)',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isPrimaryHovered ? '0 6px 20px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.1)',
        transform: isPrimaryHovered ? 'translateY(-2px)' : 'translateY(0)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
    };

    const linkStyle = {
        color: 'var(--platform-text-secondary)',
        fontSize: '0.9rem',
        textDecoration: 'none',
        borderBottom: '1px dashed var(--platform-text-secondary)',
        transition: 'color 0.2s'
    };

    return (
        <div style={containerStyle}>
            <Helmet>
                <title>Правила та Політика конфіденційності | Kendr</title>
            </Helmet>

            <h1 style={titleStyle}>Правила платформи Kendr</h1>
            <p style={subtitleStyle}>Будь ласка, уважно ознайомтеся з умовами використання та політикою конфіденційності.</p>
            
            <div style={sectionStyle}>
                <h2 style={headingStyle}>1. Умови використання (Terms of Use)</h2>
                
                <h3 style={subHeadingStyle}>1. Загальні положення</h3>
                <p style={paragraphStyle}>Платформа Kendr (далі — Платформа) надає інструменти для створення та управління веб-сайтами. Реєструючись на Платформі, ви погоджуєтесь з цими умовами.</p>

                <h3 style={subHeadingStyle}>2. Відповідальність користувача</h3>
                <p style={paragraphStyle}>Користувач несе повну відповідальність за контент, який він розміщує на створених сайтах. Заборонено створювати сайти для:</p>
                <ul style={listStyle}>
                    <li>Продажу заборонених товарів та послуг.</li>
                    <li>Шахрайства (фішингу).</li>
                    <li>Розповсюдження шкідливого ПЗ.</li>
                    <li>Розпалювання ворожнечі або дискримінації.</li>
                </ul>

                <h3 style={subHeadingStyle}>3. Права Платформи</h3>
                <p style={paragraphStyle}>Адміністрація Kendr залишає за собою право:</p>
                <ul style={listStyle}>
                    <li>Видаляти або блокувати сайти, що порушують ці правила, без попередження (статус Suspended).</li>
                    <li>Змінювати функціонал редактора та умови надання послуг.</li>
                </ul>

                <h3 style={subHeadingStyle}>4. Відмова від відповідальності</h3>
                <p style={paragraphStyle}>Платформа надається за принципом "як є" (as is). Ми не несемо відповідальності за прямі або непрямі збитки, втрату прибутку або даних, пов'язаних з використанням сервісу.</p>
            </div>

            <div style={sectionStyle}>
                <h2 style={headingStyle}>2. Політика конфіденційності (Privacy Policy)</h2>
                
                <h3 style={subHeadingStyle}>1. Які дані ми збираємо</h3>
                <p style={paragraphStyle}>Для функціонування сервісу ми зберігаємо:</p>
                <ul style={listStyle}>
                    <li>Електронну пошту та ім'я користувача (для входу).</li>
                    <li>Завантажені медіа-файли (зображення, відео).</li>
                    <li>Технічні дані (IP-адреса, файли Cookie) для забезпечення безпеки та аналітики.</li>
                </ul>

                <h3 style={subHeadingStyle}>2. Використання даних</h3>
                <p style={paragraphStyle}>Ми використовуємо ваші дані виключно для:</p>
                <ul style={listStyle}>
                    <li>Надання доступу до вашого облікового запису.</li>
                    <li>Зв'язку з вами щодо технічних питань.</li>
                    <li>Захисту платформи від зловживань.</li>
                </ul>

                <h3 style={subHeadingStyle}>3. Передача третім особам</h3>
                <p style={paragraphStyle}>Ми не продаємо і не передаємо ваші особисті дані третім особам, за винятком випадків, передбачених законодавством.</p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <button 
                    onClick={handleAgree}
                    style={primaryButtonStyle}
                    onMouseEnter={() => setIsPrimaryHovered(true)}
                    onMouseLeave={() => setIsPrimaryHovered(false)}
                >
                    Повернутися назад
                </button>
                
                <Link to="/" style={linkStyle}>
                    Повернутися на головну
                </Link>
            </div>
        </div>
    );
};

export default RulesPage;