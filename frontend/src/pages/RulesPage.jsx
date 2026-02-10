// frontend/src/pages/RulesPage.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../shared/ui/elements/Button';
import { ArrowLeft, FileText, Shield, Info } from 'lucide-react';

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

    const cardClass = "bg-(--platform-card-bg) p-10 rounded-2xl border border-(--platform-border-color) shadow-sm mb-8";
    const sectionTitleClass = "text-(--platform-text-primary) mb-6 pb-4 border-b border-(--platform-border-color) text-2xl font-bold flex items-center gap-3";
    const subHeadingClass = "text-(--platform-text-primary) mt-6 mb-3 text-lg font-semibold";
    const textClass = "text-(--platform-text-secondary) mb-4 text-base leading-relaxed";
    const listClass = "text-(--platform-text-secondary) pl-6 mb-4 list-disc leading-relaxed";
    return (
        <div className="max-w-225 mx-auto py-12 px-6 font-body">
            <Helmet>
                <title>Правила та Політика конфіденційності | Kendr</title>
            </Helmet>

            <div className="text-center mb-12">
                <h1 className="text-(--platform-text-primary) mb-4 text-4xl font-extrabold">Правила платформи Kendr</h1>
                <p className="text-(--platform-text-secondary) text-lg">
                    Будь ласка, уважно ознайомтеся з умовами використання та політикою конфіденційності.
                </p>
            </div>
            
            <div className={cardClass}>
                <h2 className={sectionTitleClass}>
                    <FileText size={28} className="text-(--platform-accent)" />
                    1. Умови використання (Terms of Use)
                </h2>
                
                <h3 className={subHeadingClass}>1. Загальні положення</h3>
                <p className={textClass}>
                    Платформа Kendr (далі — Платформа) надає інструменти для створення та управління веб-сайтами. 
                    Реєструючись на Платформі, ви погоджуєтесь з цими умовами.
                </p>

                <h3 className={subHeadingClass}>2. Відповідальність користувача</h3>
                <p className={textClass}>
                    Користувач несе повну відповідальність за контент, який він розміщує на створених сайтах. 
                    Заборонено створювати сайти для:
                </p>
                <ul className={listClass}>
                    <li>Продажу заборонених товарів та послуг.</li>
                    <li>Шахрайства (фішингу) та введення в оману.</li>
                    <li>Розповсюдження шкідливого програмного забезпечення.</li>
                    <li>Розпалювання ворожнечі, дискримінації або насильства.</li>
                </ul>

                <h3 className={subHeadingClass}>3. Права Платформи</h3>
                <p className={textClass}>Адміністрація Kendr залишає за собою право:</p>
                <ul className={listClass}>
                    <li>Видаляти або блокувати сайти, що порушують ці правила, без попередження.</li>
                    <li>Змінювати функціонал редактора та умови надання послуг у будь-який момент.</li>
                </ul>

                <h3 className={subHeadingClass}>4. Відмова від відповідальності</h3>
                <p className={textClass}>
                    Платформа надається за принципом "як є" (as is). Ми не несемо відповідальності за прямі 
                    або непрямі збитки, втрату прибутку або даних, пов'язаних з використанням сервісу.
                </p>
            </div>

            <div className={cardClass}>
                <h2 className={sectionTitleClass}>
                    <Shield size={28} className="text-(--platform-success)" />
                    2. Політика конфіденційності (Privacy Policy)
                </h2>
                
                <h3 className={subHeadingClass}>1. Які дані ми збираємо</h3>
                <p className={textClass}>Для функціонування сервісу ми зберігаємо:</p>
                <ul className={listClass}>
                    <li>Електронну пошту та ім'я користувача (для ідентифікації).</li>
                    <li>Завантажені медіа-файли (зображення, відео) необхідні для роботи ваших сайтів.</li>
                    <li>Технічні дані (IP-адреса, файли Cookie) для забезпечення безпеки та аналітики.</li>
                </ul>

                <h3 className={subHeadingClass}>2. Використання даних</h3>
                <p className={textClass}>Ми використовуємо ваші дані виключно для:</p>
                <ul className={listClass}>
                    <li>Надання доступу до вашого облікового запису.</li>
                    <li>Зв'язку з вами щодо технічних питань та оновлень.</li>
                    <li>Захисту платформи від зловживань та атак.</li>
                </ul>

                <h3 className={subHeadingClass}>3. Передача третім особам</h3>
                <p className={textClass}>
                    Ми не продаємо і не передаємо ваші особисті дані третім особам, 
                    за винятком випадків, передбачених чинним законодавством.
                </p>
            </div>

            <div className="flex flex-col items-center gap-4 mt-12">
                <Button 
                    variant="primary" 
                    onClick={handleAgree}
                    className="min-w-50"
                    icon={<ArrowLeft size={18}/>}
                >
                    Повернутися назад
                </Button>
                
                <div className="mt-4 opacity-70 text-sm flex items-center gap-2 text-(--platform-text-secondary)">
                    <Info size={16} />
                    <span>Продовжуючи роботу, ви погоджуєтесь з правилами.</span>
                </div>
            </div>
        </div>
    );
};

export default RulesPage;