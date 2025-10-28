// frontend/src/features/sites/CreateSitePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/api';

const API_URL = 'http://localhost:5000';

const CreateSitePage = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [sitePath, setSitePath] = useState('');
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    const [acceptedRules, setAcceptedRules] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [defaultLogos, setDefaultLogos] = useState([]);
    const [selectedLogo, setSelectedLogo] = useState('');
    const [customLogoFile, setCustomLogoFile] = useState(null);
    const [preview, setPreview] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const templatesResponse = await apiClient.get('/sites/templates');
                setTemplates(templatesResponse.data);
                if (templatesResponse.data.length > 0) {
                    setSelectedTemplate(templatesResponse.data[0].id);
                }

                const logosResponse = await apiClient.get('/sites/default-logos');
                setDefaultLogos(logosResponse.data);
                if (logosResponse.data.length > 0) {
                    const defaultLogoUrl = logosResponse.data[0];
                    setSelectedLogo(defaultLogoUrl);
                    setPreview(`${API_URL}${defaultLogoUrl}`);
                }
            } catch (error) {
                console.error("Помилка під час завантаження даних для створення сайту:", error);
                setError('Не вдалося завантажити необхідні дані.');
            }
        };
        fetchData();
    }, []);

    const handleCustomLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Розмір файлу не повинен перевищувати 5MB');
                return;
            }
            setCustomLogoFile(file);
            setSelectedLogo('');
            setPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSelectDefaultLogo = (logoUrl) => {
        setSelectedLogo(logoUrl);
        setCustomLogoFile(null);
        setPreview(`${API_URL}${logoUrl}`);
        const fileInput = document.getElementById('logo-upload');
        if (fileInput) fileInput.value = null;
        setError('');
    };

    const handleCreateSite = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        if (!acceptedRules) {
            setError('Для створення сайту необхідно прийняти правила платформи.');
            setIsLoading(false);
            return;
        }
        
        if (!sitePath || !title || !selectedTemplate) {
            setError('Будь ласка, заповніть усі поля.');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('templateId', selectedTemplate);
        formData.append('sitePath', sitePath);
        formData.append('title', title);

        if (customLogoFile) {
            formData.append('logo', customLogoFile);
        } else if (selectedLogo) {
            formData.append('selected_logo_url', selectedLogo);
        }

        try {
            const response = await apiClient.post('/sites/create', formData);
            alert('Сайт успішно створено!');
            navigate(`/dashboard/${response.data.site.site_path}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Сталася помилка під час створення сайту.');
        } finally {
            setIsLoading(false);
        }
    };

    // Функция для получения стилей логотипа
    const getLogoImageStyle = (currentUrl) => ({
        width: '40px',
        height: '40px',
        borderRadius: '4px',
        cursor: 'pointer',
        border: selectedLogo === currentUrl ? '3px solid var(--platform-accent)' : '3px solid transparent',
        transition: 'border 0.2s',
        padding: '2px',
        background: 'var(--platform-card-bg)',
        objectFit: 'contain'
    });

    return (
        <div className="card" style={{ maxWidth: '700px', margin: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Створення нового сайту 🎨</h2>

            <div style={{
                padding: '1rem', 
                marginBottom: '1.5rem', 
                borderRadius: '8px', 
                transition: 'border-color 0.3s',
                border: acceptedRules ? '1px solid var(--platform-success)' : '1px solid var(--platform-danger)',
                background: acceptedRules ? 'var(--platform-bg)' : 'var(--platform-bg)'
            }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                    <input 
                        type="checkbox" 
                        checked={acceptedRules} 
                        onChange={(e) => setAcceptedRules(e.target.checked)} 
                        style={{ marginTop: '3px' }}
                    />
                    <span>
                        Я ознайомився та погоджуюся з{" "}
                        <Link 
                            to="/rules" 
                            target="_blank" 
                            style={{ 
                                fontWeight: 'bold', 
                                color: 'var(--platform-accent)',
                                textDecoration: 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                            правилами платформи
                        </Link>
                    </span>
                </label>
            </div>

            {error && (
                <p className="bg-danger-light text-danger" style={{ padding: '10px', borderRadius: '4px', marginBottom: '1rem' }}>
                    {error}
                </p>
            )}
            
            <form onSubmit={handleCreateSite} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                        1. Оберіть шаблон:
                    </label>
                    <select 
                        value={selectedTemplate} 
                        onChange={e => setSelectedTemplate(e.target.value)} 
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--platform-border-color)',
                            background: 'var(--platform-card-bg)',
                            color: 'var(--platform-text-primary)',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                        required
                    >
                        {templates.map(template => (
                            <option key={template.id} value={template.id}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                    {templates.find(t => t.id === parseInt(selectedTemplate))?.description && (
                        <small className="text-secondary" style={{ fontStyle: 'italic', marginTop: '5px', display: 'block' }}>
                            {templates.find(t => t.id === parseInt(selectedTemplate))?.description}
                        </small>
                    )}
                </div>
                
                <div className="card" style={{ padding: '1rem' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                        2. Оберіть логотип:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                        {preview && (
                            <div style={{ flexShrink: 0 }}>
                                <img 
                                    src={preview} 
                                    alt="Попередній перегляд логотипу" 
                                    style={{ 
                                        width: '64px', 
                                        height: '64px', 
                                        borderRadius: '8px', 
                                        objectFit: 'contain',
                                        border: '1px solid var(--platform-border-color)'
                                    }} 
                                />
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--platform-text-secondary)', 
                                    textAlign: 'center', 
                                    marginTop: '5px' 
                                }}>
                                    Перегляд
                                </div>
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <p style={{ 
                                margin: '0 0 8px 0', 
                                padding: 0, 
                                fontWeight: '500',
                                color: 'var(--platform-text-primary)'
                            }}>
                                Стандартні логотипи:
                            </p>
                            <div style={{ 
                                display: 'flex', 
                                gap: '10px', 
                                flexWrap: 'wrap', 
                                margin: '10px 0',
                                padding: '10px',
                                backgroundColor: 'var(--platform-card-bg)',
                                borderRadius: '4px',
                                border: '1px solid var(--platform-border-color)'
                            }}>
                                {defaultLogos.map(logoUrl => (
                                    <img 
                                        key={logoUrl}
                                        src={`${API_URL}${logoUrl}`} 
                                        alt="стандартний логотип"
                                        onClick={() => handleSelectDefaultLogo(logoUrl)}
                                        style={getLogoImageStyle(logoUrl)}
                                    />
                                ))}
                            </div>
                            
                            <div style={{ marginTop: '15px' }}>
                                <label 
                                    htmlFor="logo-upload" 
                                    className="btn btn-secondary"
                                    style={{ 
                                        cursor: 'pointer', 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '8px 12px',
                                        border: '1px dashed var(--platform-border-color)',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    📁 Завантажити свій логотип (до 5МБ)
                                </label>
                                <input 
                                    type="file" 
                                    id="logo-upload" 
                                    onChange={handleCustomLogoChange} 
                                    accept="image/*" 
                                    style={{ display: 'none' }} 
                                />
                                {customLogoFile && (
                                    <div className="text-success" style={{ fontSize: '12px', marginTop: '5px' }}>
                                        Обрано файл: {customLogoFile.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                        3. Вкажіть назву та адресу:
                    </label>
                    
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Назва вашого сайту"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--platform-border-color)',
                            background: 'var(--platform-card-bg)',
                            color: 'var(--platform-text-primary)',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            marginBottom: '10px'
                        }}
                        required
                    />
                    
                    <div style={{ position: 'relative', marginTop: '10px' }}>
                        <span 
                            className="text-secondary" 
                            style={{ 
                                position: 'absolute', 
                                left: '10px', 
                                top: '10px', 
                                fontSize: '14px',
                                zIndex: 1
                            }}
                        >
                            {window.location.origin}/site/
                        </span>
                        <input
                            type="text"
                            value={sitePath}
                            onChange={e => setSitePath(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="my-cool-site"
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 145px',
                                borderRadius: '8px',
                                border: '1px solid var(--platform-border-color)',
                                background: 'var(--platform-card-bg)',
                                color: 'var(--platform-text-primary)',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>
                    <small className="text-secondary" style={{ marginTop: '5px', display: 'block' }}>
                        Можна використовувати лише латинські літери, цифри та дефіси.
                    </small>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ 
                        padding: '12px 24px', 
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        marginTop: '1rem'
                    }}
                    disabled={isLoading || !acceptedRules}
                >
                    {isLoading ? 'Створення...' : 'Створити сайт'}
                </button>
            </form>
        </div>
    );
};

export default CreateSitePage;