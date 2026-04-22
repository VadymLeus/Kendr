// frontend/src/modules/support/SupportPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/elements/Button';
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
        <div className="w-full max-w-250 mx-auto py-8 sm:py-12 px-4 sm:px-6">
            <Helmet>
                <title>Центр підтримки | Kendr</title>
            </Helmet>
            <div className="text-center mb-8 sm:mb-12">
                <h1 className="text-(--platform-text-primary) mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-[2.5rem] font-extrabold flex items-center justify-center gap-2.5 sm:gap-3">
                    <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-(--platform-accent)" />
                    Центр підтримки
                </h1>
                <p className="text-(--platform-text-secondary) text-sm sm:text-lg md:text-xl max-w-150 mx-auto leading-relaxed">
                    Ми тут, щоб допомогти. Знайдіть відповіді на питання або зв'яжіться з нами.
                </p>
            </div>
            <div className="mb-8 sm:mb-10 p-5 sm:p-8 bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) shadow-sm">
                <h2 className="text-(--platform-text-primary) mb-5 sm:mb-6 text-xl sm:text-2xl font-bold">
                    Часті запитання
                </h2>
                <div className="grid gap-3 sm:gap-4">
                    {faqItems.map((item, index) => (
                        <div 
                            key={index} 
                            className="p-4 sm:p-6 bg-(--platform-bg) rounded-xl border border-(--platform-border-color)"
                        >
                            <h3 className="text-(--platform-text-primary) mb-2 sm:mb-3 text-base sm:text-[1.1rem] font-semibold flex items-start sm:items-center gap-2.5">
                                <ChevronRight className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0 text-(--platform-accent)" />
                                <span>{item.question}</span>
                            </h3>
                            <p className="text-(--platform-text-secondary) m-0 leading-relaxed text-sm sm:text-[0.95rem] pl-7.5 sm:pl-7.5">
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-linear-to-br from-(--platform-card-bg) to-(--platform-bg) rounded-2xl border border-(--platform-border-color) py-8 sm:py-12 px-5 sm:px-8 text-center shadow-lg">
                <h3 className="text-(--platform-text-primary) mb-3 sm:mb-4 text-xl sm:text-2xl font-bold">
                    Не знайшли відповідь?
                </h3>
                <p className="text-(--platform-text-secondary) mb-6 sm:mb-8 text-sm sm:text-[1.1rem] max-w-125 mx-auto leading-relaxed">
                    Створіть звернення, і наша команда підтримки допоможе вам вирішити проблему.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full">
                    <Link to="/support/new-ticket" className="no-underline w-full sm:w-auto">
                        <Button variant="primary" size="lg" icon={<Plus size={20}/>} className="w-full">
                            Створити звернення
                        </Button>
                    </Link>
                    <Link to="/support/my-tickets" className="no-underline w-full sm:w-auto">
                        <Button variant="secondary" size="lg" icon={<MessageCircle size={20}/>} className="w-full">
                            Мої звернення
                        </Button>
                    </Link>
                    <Link to="/support/appeal" className="no-underline w-full sm:w-auto">
                         <Button variant="outline" size="lg" icon={<Gavel size={20}/>} className="w-full">
                            Апеляції
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;