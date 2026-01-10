// frontend/src/pages/RulesPage.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../shared/ui/elements/Button';
import { IconArrowLeft, IconFileText, IconShield, IconInfo } from '../shared/ui/elements/Icons';

const RulesPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

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
        maxWidth: '900px',
        margin: '0 auto',
        padding: '3rem 1.5rem',
        fontFamily: 'var(--font-body)'
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '3rem'
    };

    const titleStyle = {
        color: 'var(--platform-text-primary)',
        marginBottom: '1rem',
        fontSize: '2.5rem',
        fontWeight: '800'
    };

    const subtitleStyle = {
        color: 'var(--platform-text-secondary)',
        fontSize: '1.1rem'
    };

    const cardStyle = {
        background: 'var(--platform-card-bg)',
        padding: '2.5rem',
        borderRadius: '16px',
        border: '1px solid var(--platform-border-color)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '2rem'
    };

    const sectionTitleStyle = {
        color: 'var(--platform-text-primary)',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--platform-border-color)',
        fontSize: '1.5rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const subHeadingStyle = {
        color: 'var(--platform-text-primary)',
        margin: '1.5rem 0 0.75rem 0',
        fontSize: '1.1rem',
        fontWeight: '600'
    };

    const textStyle = {
        color: 'var(--platform-text-secondary)',
        marginBottom: '1rem',
        fontSize: '1rem',
        lineHeight: '1.7'
    };

    const listStyle = {
        color: 'var(--platform-text-secondary)',
        paddingLeft: '1.5rem',
        marginBottom: '1rem',
        listStyleType: 'disc',
        lineHeight: '1.6'
    };

    return (
        <div style={containerStyle}>
            <Helmet>
                <title>Правила та Політика конфіденційності | Kendr</title>
            </Helmet>

            <div style={headerStyle}>
                <h1 style={titleStyle}>Правила платформи Kendr</h1>
                <p style={subtitleStyle}>
                    Будь ласка, уважно ознайомтеся з умовами використання та політикою конфіденційності.
                </p>
            </div>
            
            <div style={cardStyle}>
                <h2 style={sectionTitleStyle}>
                    <IconFileText size={28} style={{ color: 'var(--platform-accent)' }} />
                    1. Умови використання (Terms of Use)
                </h2>
                
                <h3 style={subHeadingStyle}>1. Загальні положення</h3>
                <p style={textStyle}>
                    Платформа Kendr (далі — Платформа) надає інструменти для створення та управління веб-сайтами. 
                    Реєструючись на Платформі, ви погоджуєтесь з цими умовами.
                </p>

                <h3 style={subHeadingStyle}>2. Відповідальність користувача</h3>
                <p style={textStyle}>
                    Користувач несе повну відповідальність за контент, який він розміщує на створених сайтах. 
                    Заборонено створювати сайти для:
                </p>
                <ul style={listStyle}>
                    <li>Продажу заборонених товарів та послуг.</li>
                    <li>Шахрайства (фішингу) та введення в оману.</li>
                    <li>Розповсюдження шкідливого програмного забезпечення.</li>
                    <li>Розпалювання ворожнечі, дискримінації або насильства.</li>
                </ul>

                <h3 style={subHeadingStyle}>3. Права Платформи</h3>
                <p style={textStyle}>Адміністрація Kendr залишає за собою право:</p>
                <ul style={listStyle}>
                    <li>Видаляти або блокувати сайти, що порушують ці правила, без попередження.</li>
                    <li>Змінювати функціонал редактора та умови надання послуг у будь-який момент.</li>
                </ul>

                <h3 style={subHeadingStyle}>4. Відмова від відповідальності</h3>
                <p style={textStyle}>
                    Платформа надається за принципом "як є" (as is). Ми не несемо відповідальності за прямі 
                    або непрямі збитки, втрату прибутку або даних, пов'язаних з використанням сервісу.
                </p>
            </div>

            <div style={cardStyle}>
                <h2 style={sectionTitleStyle}>
                    <IconShield size={28} style={{ color: 'var(--platform-success)' }} />
                    2. Політика конфіденційності (Privacy Policy)
                </h2>
                
                <h3 style={subHeadingStyle}>1. Які дані ми збираємо</h3>
                <p style={textStyle}>Для функціонування сервісу ми зберігаємо:</p>
                <ul style={listStyle}>
                    <li>Електронну пошту та ім'я користувача (для ідентифікації).</li>
                    <li>Завантажені медіа-файли (зображення, відео) необхідні для роботи ваших сайтів.</li>
                    <li>Технічні дані (IP-адреса, файли Cookie) для забезпечення безпеки та аналітики.</li>
                </ul>

                <h3 style={subHeadingStyle}>2. Використання даних</h3>
                <p style={textStyle}>Ми використовуємо ваші дані виключно для:</p>
                <ul style={listStyle}>
                    <li>Надання доступу до вашого облікового запису.</li>
                    <li>Зв'язку з вами щодо технічних питань та оновлень.</li>
                    <li>Захисту платформи від зловживань та атак.</li>
                </ul>

                <h3 style={subHeadingStyle}>3. Передача третім особам</h3>
                <p style={textStyle}>
                    Ми не продаємо і не передаємо ваші особисті дані третім особам, 
                    за винятком випадків, передбачених чинним законодавством.
                </p>
            </div>

            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '1rem',
                marginTop: '3rem'
            }}>
                <Button 
                    variant="primary" 
                    onClick={handleAgree}
                    style={{ minWidth: '200px' }}
                    icon={<IconArrowLeft size={18}/>}
                >
                    Повернутися назад
                </Button>
                
                <div style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconInfo size={16} />
                    <span>Продовжуючи роботу, ви погоджуєтесь з правилами.</span>
                </div>
            </div>
        </div>
    );
};

export default RulesPage;