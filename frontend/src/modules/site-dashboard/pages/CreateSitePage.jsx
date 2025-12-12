// frontend/src/modules/site-dashboard/pages/CreateSitePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../../common/services/api';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000';

const CreateSitePage = () => {
    const [templates, setTemplates] = useState([]);
    const [personalTemplates, setPersonalTemplates] = useState([]);
    const [activeTab, setActiveTab] = useState('gallery');
    
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [sitePath, setSitePath] = useState('');
    const [title, setTitle] = useState('');
    const [acceptedRules, setAcceptedRules] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    
    const [defaultLogos, setDefaultLogos] = useState([]);
    const [selectedLogo, setSelectedLogo] = useState('');
    const [customLogoFile, setCustomLogoFile] = useState(null);
    const [preview, setPreview] = useState('');
    
    const navigate = useNavigate();

    const generateSitePathFromTitle = (titleText) => {
        return titleText
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        
        if (!sitePath || sitePath === generateSitePathFromTitle(title)) {
            setSitePath(generateSitePathFromTitle(newTitle));
        }
    };

    const handleSitePathChange = (e) => {
        const val = e.target.value.toLowerCase();
        const cleanVal = val.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setSitePath(cleanVal);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsDataLoading(true);
            try {
                const templatesResponse = await apiClient.get('/sites/templates');
                setTemplates(templatesResponse.data);
                
                if (templatesResponse.data.length > 0 && activeTab === 'gallery') {
                    setSelectedTemplate(templatesResponse.data[0].id.toString());
                }

                const logosResponse = await apiClient.get('/sites/default-logos');
                setDefaultLogos(logosResponse.data);
                
                if (logosResponse.data.length > 0) {
                    const defaultLogoUrl = logosResponse.data[0];
                    setSelectedLogo(defaultLogoUrl);
                    setPreview(`${API_URL}${defaultLogoUrl}`);
                }
            } catch (error) {
                console.error("Помилка під час завантаження даних:", error);
                toast.error('Не вдалося завантажити дані шаблонів або логотипів.');
            } finally {
                setIsDataLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'personal') {
            apiClient.get('/templates/personal')
                .then(res => {
                    setPersonalTemplates(res.data);
                    if (res.data.length > 0) {
                        setSelectedTemplate(res.data[0].id.toString());
                    } else {
                        setSelectedTemplate('');
                    }
                })
                .catch(err => console.error(err));
        } else if (activeTab === 'gallery' && templates.length > 0) {
            setSelectedTemplate(templates[0].id.toString());
        }
    }, [activeTab, templates]);

    const handleCustomLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { 
                toast.error('Розмір файлу не повинен перевищувати 5MB');
                return;
            }
            setCustomLogoFile(file);
            setSelectedLogo('');
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSelectDefaultLogo = (logoUrl) => {
        setSelectedLogo(logoUrl);
        setCustomLogoFile(null);
        setPreview(`${API_URL}${logoUrl}`);
        const fileInput = document.getElementById('logo-upload');
        if (fileInput) fileInput.value = null;
    };

    const handleDeleteTemplate = async () => {
        if (!selectedTemplate) return;
        if (!window.confirm('Ви впевнені, що хочете назавжди видалити обраний шаблон?')) return;

        try {
            await apiClient.delete(`/templates/personal/${selectedTemplate}`);
            
            const newTemplates = personalTemplates.filter(t => t.id.toString() !== selectedTemplate);
            setPersonalTemplates(newTemplates);
            
            if (newTemplates.length > 0) {
                setSelectedTemplate(newTemplates[0].id.toString());
            } else {
                setSelectedTemplate('');
            }
            toast.success('Шаблон видалено');
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateSite = async (e) => {
        e.preventDefault();
        
        if (!acceptedRules) {
            toast.warning('Для створення сайту необхідно прийняти правила платформи.');
            return;
        }
        
        if (!sitePath || !title || !selectedTemplate) {
            toast.warning('Будь ласка, заповніть усі поля та оберіть шаблон.');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('templateId', selectedTemplate);
        formData.append('sitePath', sitePath);
        formData.append('title', title);
        
        if (activeTab === 'personal') {
            formData.append('isPersonal', 'true');
        }

        if (customLogoFile) {
            formData.append('logo', customLogoFile);
        } else if (selectedLogo) {
            formData.append('selected_logo_url', selectedLogo);
        }

        try {
            const response = await apiClient.post('/sites/create', formData);
            toast.success('Сайт успішно створено! Переходимо в редактор...');
            setTimeout(() => {
                navigate(`/dashboard/${response.data.site.site_path}`);
            }, 1000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

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

    const tabStyle = (isActive) => ({
        padding: '0.8rem 1.5rem',
        cursor: 'pointer',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: isActive ? '2px solid var(--platform-accent)' : '2px solid transparent',
        color: isActive ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
        fontWeight: isActive ? 'bold' : 'normal',
        background: 'none',
        fontSize: '1rem',
        flex: 1,
        textAlign: 'center',
        transition: 'all 0.2s ease'
    });

    const currentTemplateList = activeTab === 'gallery' ? templates : personalTemplates;
    const selectedTemplateObj = currentTemplateList.find(t => t.id.toString() === selectedTemplate);

    if (isDataLoading) {
        return (
            <div className="card" style={{ maxWidth: '700px', margin: 'auto', textAlign: 'center', padding: '2rem' }}>
                Завантаження...
            </div>
        );
    }

    return (
        <div className="card" style={{ maxWidth: '700px', margin: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Створення нового сайту 🎨</h2>
            
            <form onSubmit={handleCreateSite} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                        1. Оберіть шаблон:
                    </label>
                    
                    <div style={{ 
                        display: 'flex', 
                        marginBottom: '1rem', 
                        borderBottom: '1px solid var(--platform-border-color)' 
                    }}>
                        <button type="button" style={tabStyle(activeTab === 'gallery')} onClick={() => setActiveTab('gallery')}>
                            🏛️ Галерея
                        </button>
                        <button type="button" style={tabStyle(activeTab === 'personal')} onClick={() => setActiveTab('personal')}>
                            👤 Мої Шаблони
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select 
                            value={selectedTemplate} 
                            onChange={e => setSelectedTemplate(e.target.value)} 
                            required
                            disabled={currentTemplateList.length === 0}
                            style={{ 
                                width: '100%', 
                                padding: '0.8rem', 
                                borderRadius: '6px', 
                                border: '1px solid var(--platform-border-color)', 
                                background: 'var(--platform-card-bg)', 
                                color: 'var(--platform-text-primary)',
                                cursor: currentTemplateList.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {currentTemplateList.length === 0 ? (
                                <option value="" disabled>Список порожній</option>
                            ) : (
                                <>
                                    <option value="" disabled>-- Оберіть шаблон --</option>
                                    {currentTemplateList.map(template => ( 
                                        <option key={template.id} value={template.id}>
                                            {template.name} {activeTab === 'personal' ? `(від ${new Date(template.created_at).toLocaleDateString()})` : ''}
                                        </option> 
                                    ))}
                                </>
                            )}
                        </select>

                        {activeTab === 'personal' && selectedTemplate && (
                            <button 
                                type="button"
                                onClick={handleDeleteTemplate}
                                title="Видалити цей шаблон"
                                style={{
                                    background: 'var(--platform-danger)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0 1rem',
                                    height: '45px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem'
                                }}
                            >
                                🗑️
                            </button>
                        )}
                    </div>

                    <div style={{ marginTop: '10px', minHeight: '20px' }}>
                        {currentTemplateList.length === 0 ? (
                            <p className="text-secondary" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                                {activeTab === 'gallery' 
                                    ? "Системні шаблони не завантажено." 
                                    : "У вас немає збережених шаблонів. Ви можете зберегти будь-який свій сайт як шаблон у його налаштуваннях."}
                            </p>
                        ) : selectedTemplateObj ? (
                            <p 
                                className="text-secondary" 
                                style={{ 
                                    fontSize: '0.9rem', 
                                    borderLeft: '3px solid var(--platform-accent)', 
                                    paddingLeft: '10px' 
                                }}
                            >
                                {selectedTemplateObj.description || 'Опис відсутній.'}
                            </p>
                        ) : null}
                    </div>
                </div>
                
                <div className="card" style={{ padding: '1rem', background: 'var(--platform-bg)' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                        2. Оберіть логотип:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                        {preview && (
                            <div style={{ flexShrink: 0 }}>
                                <img 
                                    src={preview} 
                                    alt="Лого" 
                                    style={{ 
                                        width: '64px', 
                                        height: '64px', 
                                        borderRadius: '8px', 
                                        objectFit: 'contain', 
                                        border: '1px solid var(--platform-border-color)', 
                                        background: 'var(--platform-card-bg)' 
                                    }} 
                                />
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 8px 0', padding: 0, fontWeight: '500', fontSize: '0.9rem' }}>
                                Стандартні:
                            </p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '10px 0' }}>
                                {defaultLogos.map(logoUrl => (
                                    <img 
                                        key={logoUrl} 
                                        src={`${API_URL}${logoUrl}`} 
                                        alt="Стандартний логотип" 
                                        onClick={() => handleSelectDefaultLogo(logoUrl)} 
                                        style={getLogoImageStyle(logoUrl)} 
                                    />
                                ))}
                            </div>
                            <div style={{ marginTop: '15px' }}>
                                <label 
                                    htmlFor="logo-upload" 
                                    className="btn btn-secondary" 
                                    style={{fontSize: '0.9rem'}}
                                >
                                    📁 Завантажити свій (до 5МБ)
                                </label>
                                <input 
                                    type="file" 
                                    id="logo-upload" 
                                    onChange={handleCustomLogoChange} 
                                    accept="image/*" 
                                    style={{ display: 'none' }}
                                />
                                {customLogoFile && ( 
                                    <div 
                                        className="text-success" 
                                        style={{ fontSize: '12px', marginTop: '5px' }}
                                    >
                                        Обрано: {customLogoFile.name}
                                    </div> 
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                        3. Налаштування адреси:
                    </label>
                    
                    <div style={{ marginBottom: '10px' }}>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={handleTitleChange} 
                            placeholder="Назва вашого сайту" 
                            required 
                            style={{ 
                                width: '100%', 
                                padding: '0.8rem', 
                                borderRadius: '6px', 
                                border: '1px solid var(--platform-border-color)', 
                                background: 'var(--platform-card-bg)', 
                                color: 'var(--platform-text-primary)', 
                                boxSizing: 'border-box' 
                            }}
                        />
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'stretch',
                        border: '1px solid var(--platform-border-color)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: 'var(--platform-card-bg)',
                        width: '100%'
                    }}>
                        <div style={{ 
                            background: 'var(--platform-bg)', 
                            color: 'var(--platform-text-secondary)',
                            padding: '0 1rem',
                            borderRight: '1px solid var(--platform-border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap',
                            userSelect: 'none'
                        }}>
                            {window.location.origin}/site/
                        </div>
                        <input 
                            type="text" 
                            value={sitePath} 
                            onChange={handleSitePathChange} 
                            placeholder="my-cool-site" 
                            style={{ 
                                flex: 1, 
                                minWidth: '100px',
                                border: 'none', 
                                padding: '0.8rem', 
                                background: 'transparent', 
                                color: 'var(--platform-text-primary)', 
                                fontSize: '1rem',
                                outline: 'none'
                            }} 
                            required
                        />
                    </div>
                    
                    <small className="text-secondary" style={{ marginTop: '5px', display: 'block' }}>
                        Латинські літери, цифри та дефіси.
                    </small>
                </div>

                <div style={{
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: acceptedRules ? '1px solid var(--platform-success)' : '1px solid var(--platform-border-color)',
                    background: acceptedRules ? 'rgba(56, 161, 105, 0.05)' : 'var(--platform-bg)',
                    marginTop: '0.5rem'
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            checked={acceptedRules} 
                            onChange={(e) => setAcceptedRules(e.target.checked)} 
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.95rem' }}>
                            Я ознайомився та погоджуюся з{" "}
                            <Link 
                                to="/rules?from=create-site" 
                                target="_blank" 
                                style={{ fontWeight: 'bold', color: 'var(--platform-accent)' }}
                            >
                                правилами платформи
                            </Link>
                        </span>
                    </label>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ 
                        padding: '12px 24px', 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold', 
                        marginTop: '0.5rem' 
                    }} 
                    disabled={isLoading || isDataLoading || !acceptedRules || !selectedTemplate}
                >
                    {isLoading ? 'Створення...' : '🚀 Створити сайт'}
                </button>
            </form>
        </div>
    );
};

export default CreateSitePage;