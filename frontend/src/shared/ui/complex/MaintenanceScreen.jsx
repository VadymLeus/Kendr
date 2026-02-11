// frontend/src/shared/ui/complex/MaintenanceScreen.jsx
import React from 'react';
import { Construction, RefreshCcw, LogOut } from 'lucide-react';

const MaintenanceScreen = ({ message }) => {
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; 
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center font-sans transition-colors duration-300"
             style={{ backgroundColor: 'var(--platform-bg)', color: 'var(--platform-text-primary)' }}>
            <div className="p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full border transition-colors duration-300"
                 style={{ 
                     backgroundColor: 'var(--platform-card-bg)', 
                     borderColor: 'var(--platform-border-color)' 
                 }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                     style={{ 
                         color: 'var(--platform-accent)',
                         backgroundColor: 'color-mix(in srgb, var(--platform-accent), transparent 90%)'
                     }}>
                    <Construction size={40} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-4"
                    style={{ color: 'var(--platform-text-primary)' }}>
                    Ми оновлюємося
                </h1>
                
                <p className="mb-8 leading-relaxed"
                   style={{ color: 'var(--platform-text-secondary)' }}>
                    {message || "Платформа тимчасово недоступна через планові технічні роботи. Ми впроваджуємо нові функції, щоб зробити ваш досвід ще кращим."}
                    <br/><br/>
                    Будь ласка, завітайте трохи пізніше.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all w-full hover:opacity-90 active:scale-[0.98]"
                        style={{ 
                            backgroundColor: 'var(--platform-accent)', 
                            color: 'var(--platform-accent-text)' 
                        }}
                    >
                        <RefreshCcw size={18} />
                        Перевірити доступ
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors w-full border"
                        style={{ 
                            backgroundColor: 'transparent',
                            borderColor: 'var(--platform-border-color)',
                            color: 'var(--platform-text-secondary)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--platform-hover-bg)';
                            e.currentTarget.style.color = 'var(--platform-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--platform-text-secondary)';
                        }}
                    >
                        <LogOut size={18} />
                        Вийти з акаунта
                    </button>
                </div>
            </div>
            <div className="mt-8 text-sm"
                 style={{ color: 'var(--platform-text-secondary)', opacity: 0.6 }}>
                &copy; Kendr
            </div>
        </div>
    );
};

export default MaintenanceScreen;