// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../shared/ui/elements/Button';
import { Eye, ArrowRight } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-8 max-w-200 mx-auto">
            <h1 className="text-(--platform-text-primary) text-5xl mb-6 font-extrabold leading-tight flex items-center gap-4 flex-wrap justify-center">
                Ласкаво просимо до Kendr! 
                <span className="inline-flex text-(--platform-accent)">
                    <Eye size={48} />
                </span>
            </h1>
            
            <p className="text-(--platform-text-secondary) text-xl mb-12 leading-relaxed max-w-150">
                Ваша платформа для створення неймовірних сайтів. 
                Просто, швидко та ефективно.
            </p>

            <div className="flex gap-4">
                <Link to="/register" className="no-underline">
                    <Button 
                        variant="primary" 
                        className="py-3 px-8 text-lg"
                        icon={<ArrowRight size={20}/>}
                    >
                        Почати безкоштовно
                    </Button>
                </Link>
                
                <Link to="/catalog" className="no-underline">
                    <Button 
                        variant="outline" 
                        className="py-3 px-8 text-lg"
                    >
                        Каталог
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;