// frontend/src/modules/support/pages/SupportPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/ui/elements/Button';
import { Helmet } from 'react-helmet-async';
import { HelpCircle, MessageCircle, Gavel, ChevronRight, Plus } from 'lucide-react';

const SupportPage = () => {
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
        <div className="max-w-250 mx-auto py-12 px-6">
            <Helmet>
                <title>Центр підтримки | Kendr</title>
            </Helmet>

            <div className="text-center mb-12">
                <h1 className="text-(--platform-text-primary) mb-4 text-[2.5rem] font-extrabold flex items-center justify-center gap-3">
                    <HelpCircle size={40} className="text-(--platform-accent)" />
                    Центр підтримки
                </h1>
                <p className="text-(--platform-text-secondary) text-xl max-w-150 mx-auto">
                    Ми тут, щоб допомогти. Знайдіть відповіді на питання або зв'яжіться з нами.
                </p>
            </div>

            <div className="mb-10 p-8 bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) shadow-sm">
                <h2 className="text-(--platform-text-primary) mb-6 text-2xl font-bold">
                    Часті запитання (FAQ)
                </h2>
                <div className="grid gap-4">
                    {faqItems.map((item, index) => (
                        <div 
                            key={index} 
                            className="p-6 bg-(--platform-bg) rounded-xl border border-(--platform-border-color)"
                        >
                            <h3 className="text-(--platform-text-primary) mb-3 text-[1.1rem] font-semibold flex items-center gap-2">
                                <ChevronRight size={18} className="text-(--platform-accent)" />
                                {item.question}
                            </h3>
                            <p className="text-(--platform-text-secondary) m-0 leading-relaxed text-[0.95rem] pl-6.5">
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-linear-to-br from-(--platform-card-bg) to-(--platform-bg) rounded-2xl border border-(--platform-border-color) py-12 px-8 text-center shadow-lg">
                <h3 className="text-(--platform-text-primary) mb-4 text-2xl font-bold">
                    Не знайшли відповідь?
                </h3>
                <p className="text-(--platform-text-secondary) mb-8 text-[1.1rem] max-w-125 mx-auto">
                    Створіть звернення, і наша команда підтримки допоможе вам вирішити проблему.
                </p>
                
                <div className="flex gap-4 justify-center flex-wrap">
                    <Link to="/support/new-ticket" className="no-underline">
                        <Button variant="primary" size="lg" icon={<Plus size={20}/>}>
                            Створити звернення
                        </Button>
                    </Link>

                    <Link to="/support/my-tickets" className="no-underline">
                        <Button variant="secondary" size="lg" icon={<MessageCircle size={20}/>}>
                            Мої звернення
                        </Button>
                    </Link>
                    
                    <Link to="/support/appeal" className="no-underline">
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