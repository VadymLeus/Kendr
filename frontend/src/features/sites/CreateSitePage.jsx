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
    const navigate = useNavigate();

    // Стани для логотипа
    const [defaultLogos, setDefaultLogos] = useState([]);
    const [selectedLogo, setSelectedLogo] = useState('');
    const [customLogoFile, setCustomLogoFile] = useState(null);
    const [preview, setPreview] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Завантажуємо шаблони
                const templatesResponse = await apiClient.get('/sites/templates');
                setTemplates(templatesResponse.data);
                if (templatesResponse.data.length > 0) {
                    setSelectedTemplate(templatesResponse.data[0].id);
                }

                // Завантажуємо стандартні логотипи
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

    // Обробник для завантаження власного логотипа
    const handleCustomLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Перевірка розміру файлу (5MB)
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

    // Обробник для вибору стандартного логотипа
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
        
        // Перевірка прийняття правил
        if (!acceptedRules) {
            setError('Для створення сайту необхідно прийняти правила платформи.');
            return;
        }
        
        if (!sitePath || !title || !selectedTemplate) {
            setError('Будь ласка, заповніть усі поля.');
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
            navigate(`/site/${response.data.site.site_path}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Сталася помилка під час створення сайту.');
        }
    };
    
    return (
        <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
            <h2>Створення нового сайту 🎨</h2>

            {/* Інформаційний блок із прапорцем */}
            <div style={{ 
                padding: '1rem', 
                marginBottom: '1.5rem', 
                background: '#f6ffed', 
                border: acceptedRules ? '1px solid #52c41a' : '1px solid #ffa39e',
                borderRadius: '8px',
                transition: 'border-color 0.3s'
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
                                color: '#1890ff',
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
                <p style={{ 
                    color: 'red', 
                    border: '1px solid red', 
                    padding: '10px',
                    borderRadius: '4px',
                    backgroundColor: '#fff2f0'
                }}>
                    {error}
                </p>
            )}
            
            <form onSubmit={handleCreateSite} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Блок вибору шаблону */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                        1. Оберіть шаблон:
                    </label>
                    <select 
                        value={selectedTemplate} 
                        onChange={e => setSelectedTemplate(e.target.value)} 
                        style={{ 
                            width: '100%', 
                            padding: '10px', 
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                    >
                        {templates.map(template => (
                            <option key={template.id} value={template.id}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                    {templates.find(t => t.id === parseInt(selectedTemplate))?.description && (
                        <small style={{ color: '#666', fontStyle: 'italic', marginTop: '5px', display: 'block' }}>
                            {templates.find(t => t.id === parseInt(selectedTemplate))?.description}
                        </small>
                    )}
                </div>
                
                {/* Блок вибору логотипа */}
                <div style={{ 
                    border: '1px solid #eee', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                }}>
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
                                        border: '1px solid #ddd'
                                    }} 
                                />
                                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '5px' }}>
                                    Перегляд
                                </div>
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 8px 0', padding: 0, fontWeight: '500' }}>
                                Стандартні логотипи:
                            </p>
                            <div style={{ 
                                display: 'flex', 
                                gap: '10px', 
                                flexWrap: 'wrap', 
                                margin: '10px 0',
                                padding: '10px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                border: '1px solid #e8e8e8'
                            }}>
                                {defaultLogos.map(url => (
                                    <img 
                                        key={url}
                                        src={`${API_URL}${url}`} 
                                        alt="стандартний логотип"
                                        onClick={() => handleSelectDefaultLogo(url)}
                                        style={{ 
                                            width: '40px', 
                                            height: '40px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            border: selectedLogo === url ? '3px solid #007bff' : '3px solid transparent',
                                            transition: 'border 0.2s',
                                            padding: '2px',
                                            background: '#f0f0f0',
                                            objectFit: 'contain'
                                        }}
                                    />
                                ))}
                            </div>
                            
                            <div style={{ marginTop: '15px' }}>
                                <label 
                                    htmlFor="logo-upload" 
                                    style={{ 
                                        cursor: 'pointer', 
                                        color: '#007bff', 
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '8px 12px',
                                        border: '1px dashed #007bff',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f0f8ff';
                                        e.target.style.textDecoration = 'underline';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.textDecoration = 'none';
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
                                    <div style={{ fontSize: '12px', color: '#52c41a', marginTop: '5px' }}>
                                        Обрано файл: {customLogoFile.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Блок назви та адреси */}
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
                            padding: '10px', 
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            fontSize: '14px',
                            marginBottom: '10px',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                    
                    <div style={{ position: 'relative' }}>
                        <span style={{ 
                            position: 'absolute', 
                            left: '10px', 
                            top: '10px', 
                            color: '#888',
                            fontSize: '14px',
                            zIndex: 1
                        }}>
                            {window.location.origin}/site/
                        </span>
                        <input
                            type="text"
                            value={sitePath}
                            onChange={e => setSitePath(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="my-cool-site"
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                paddingLeft: '145px',
                                border: '1px solid #d9d9d9',
                                borderRadius: '4px',
                                fontSize: '14px',
                                position: 'relative',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>
                    <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                        Можна використовувати лише латинські літери, цифри та дефіси.
                    </small>
                </div>

                <button 
                    type="submit" 
                    style={{ 
                        padding: '12px 24px', 
                        fontSize: '1rem', 
                        cursor: 'pointer',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#40a9ff'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#1890ff'}
                >
                    Створити сайт
                </button>
            </form>
        </div>
    );
};

export default CreateSitePage;