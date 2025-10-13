// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Ласкаво просимо до GreenKendr! 🚀</h1>
            <p>Ваша платформа для створення неймовірних мінісайтів.</p>
            <Link to="/register">
                <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                    Почати безкоштовно
                </button>
            </Link>
        </div>
    );
};

export default HomePage;