// frontend/src/modules/renderer/components/FontPicker.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { FONT_LIBRARY } from '../../editor/core/editorConfig';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { Button } from '../../../shared/ui/elements/Button';
import MediaPickerModal from '../../media/components/MediaPickerModal';
import { Search, Plus, Trash2, Edit2, Check, Type, Globe, Folder, ChevronDown } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const EVENT_FONT_CHANGED = 'platform:font-changed';
const STORAGE_HIDDEN_KEY = 'platform_hidden_fonts';
const FontPicker = ({ 
    label, 
    value, 
    onChange, 
    type = 'heading'
}) => {
    const [localFonts, setLocalFonts] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [previewFont, setPreviewFont] = useState(value);
    const [sections, setSections] = useState(() => {
        try {
            const saved = localStorage.getItem('fontPickerSections');
            return saved ? JSON.parse(saved) : { custom: true, google: true };
        } catch (e) {
            return { custom: true, google: true };
        }
    });

    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [editingListId, setEditingListId] = useState(null); 
    const [editName, setEditName] = useState('');
    const { confirm } = useConfirm();
    useEffect(() => {
        localStorage.setItem('fontPickerSections', JSON.stringify(sections));
    }, [sections]);

    const fetchAllFonts = useCallback(async () => {
        try {
            const res = await apiClient.get('/media');
            if (Array.isArray(res.data)) {
                let hiddenFonts = [];
                try {
                    hiddenFonts = JSON.parse(localStorage.getItem(STORAGE_HIDDEN_KEY) || '[]');
                } catch (e) { hiddenFonts = []; }

                const serverFonts = res.data.filter(f => 
                    (f.file_type === 'font' || 
                    f.mime_type?.includes('font') || 
                    /\.(ttf|otf|woff|woff2)$/i.test(f.original_file_name)) &&
                    !hiddenFonts.includes(f.path_full)
                );

                const formattedFonts = serverFonts.map(f => ({
                    ...f,
                    id: f.id,
                    listId: f.id, 
                    label: f.display_name || f.alt_text || f.original_file_name,
                    value: f.path_full,
                    isCustom: true,
                    isTemp: false 
                }));

                setLocalFonts(prev => {
                    const uniqueMap = new Map();
                    
                    prev.forEach(item => {
                        if (item.isTemp) uniqueMap.set(item.path_full, item);
                    });
                    
                    formattedFonts.forEach(item => {
                        uniqueMap.set(item.path_full, item);
                    });
                    
                    return Array.from(uniqueMap.values());
                });
            }
        } catch (e) {
            console.error("Failed to load fonts list", e);
        }
    }, []);

    useEffect(() => {
        fetchAllFonts();
    }, [fetchAllFonts]);

    useEffect(() => {
        const handleRemoteChange = () => {
            fetchAllFonts();
        };

        window.addEventListener(EVENT_FONT_CHANGED, handleRemoteChange);
        return () => window.removeEventListener(EVENT_FONT_CHANGED, handleRemoteChange);
    }, [fetchAllFonts]);

    useEffect(() => {
        const syncCurrentValue = async () => {
            if (!value || value === 'global' || value === 'site_heading' || value === 'site_body' || !value.includes('/uploads/')) return;

            setLocalFonts(prev => {
                if (prev.some(f => f.path_full === value)) return prev;

                const fileName = value.split('/').pop();
                const newFont = {
                    id: null,
                    listId: `temp-${Date.now()}`,
                    path_full: value,
                    value: value,
                    original_file_name: fileName,
                    label: fileName, 
                    isCustom: true,
                    isTemp: true
                };

                return [newFont, ...prev];
            });
        };

        syncCurrentValue();
    }, [value]);

    useEffect(() => {
        setPreviewFont(value);
    }, [value]);

    const toggleSection = (section) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleMediaSelect = (file) => {
        const selectedFile = Array.isArray(file) ? file[0] : file;
        if (!selectedFile) return;

        const isFont = selectedFile.file_type === 'font' || 
                       selectedFile.mime_type?.includes('font') || 
                       /\.(ttf|otf|woff|woff2)$/i.test(selectedFile.original_file_name);
        
        if (!isFont) {
            toast.warning('Файл може не працювати як шрифт');
        }

        try {
            const hiddenFonts = JSON.parse(localStorage.getItem(STORAGE_HIDDEN_KEY) || '[]');
            if (hiddenFonts.includes(selectedFile.path_full)) {
                const newHidden = hiddenFonts.filter(path => path !== selectedFile.path_full);
                localStorage.setItem(STORAGE_HIDDEN_KEY, JSON.stringify(newHidden));
            }
        } catch (e) { console.error(e); }
        onChange(selectedFile.path_full);
        setIsMediaModalOpen(false);
        toast.success('Шрифт вибрано');
        window.dispatchEvent(new Event(EVENT_FONT_CHANGED));
        if (!sections.custom) {
            setSections(prev => ({ ...prev, custom: true }));
        }
    };

    const handleDelete = async (listId, name, e) => {
        e.stopPropagation();
        
        const itemToDelete = localFonts.find(f => f.listId === listId);

        const isConfirmed = await confirm({
            title: "Прибрати шрифт?",
            message: `Прибрати "${name}" зі списку? Файл залишиться в медіатеці, але не буде відображатися тут.`,
            type: "warning",
            confirmLabel: "Прибрати"
        });

        if (!isConfirmed) return;

        if (itemToDelete) {
            try {
                const hiddenFonts = JSON.parse(localStorage.getItem(STORAGE_HIDDEN_KEY) || '[]');
                if (!hiddenFonts.includes(itemToDelete.path_full)) {
                    hiddenFonts.push(itemToDelete.path_full);
                    localStorage.setItem(STORAGE_HIDDEN_KEY, JSON.stringify(hiddenFonts));
                }
            } catch (err) { console.error(err); }

            if (value === itemToDelete.path_full) {
                onChange("global");
                toast.info('Шрифт скинуто на стандартний');
            }

            window.dispatchEvent(new Event(EVENT_FONT_CHANGED));
            toast.success('Шрифт прибрано зі списку');
        }
    };

    const startEditing = (listId, currentLabel, e) => {
        e.stopPropagation();
        setEditingListId(listId);
        setEditName(currentLabel);
    };

    const saveName = async (listId, e) => {
        e.stopPropagation();
        if (!editName.trim()) {
            setEditingListId(null);
            return;
        }

        const fontItem = localFonts.find(f => f.listId === listId);
        setEditingListId(null);
        if (fontItem && fontItem.id && !fontItem.isTemp) {
            try {
                await apiClient.put(`/media/${fontItem.id}`, { display_name: editName });
                toast.success('Назву збережено');
                window.dispatchEvent(new Event(EVENT_FONT_CHANGED));
            } catch (error) {
                console.error("Failed to update font name", error);
                toast.error('Не вдалося зберегти нову назву');
            }
        } else {
             setLocalFonts(prev => prev.map(f => {
                if (f.listId === listId) {
                    return { ...f, label: editName };
                }
                return f;
            }));
        }
    };

    const { customList, googleList } = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const uniqueCustomMap = new Map();
        localFonts.forEach(f => {
            const nameToSearch = f.label || f.original_file_name || '';
            if (nameToSearch.toLowerCase().includes(lowerSearch)) {
                uniqueCustomMap.set(f.path_full, {
                    ...f,
                    isCustom: true,
                    value: f.path_full 
                });
            }
        });

        const custom = Array.from(uniqueCustomMap.values());
        const google = FONT_LIBRARY
            .filter(f => f.value !== 'global' && f.value !== 'site_heading' && f.value !== 'site_body')
            .filter(f => f.label.toLowerCase().includes(lowerSearch))
            .map(f => ({
                id: f.value,
                listId: f.value, 
                label: f.label,
                value: f.value,
                isCustom: false
            }));

        return { customList: custom, googleList: google };
    }, [localFonts, searchTerm]);

    useEffect(() => {
        if (!previewFont || previewFont === 'global' || previewFont === 'site_heading' || previewFont === 'site_body') return;
        const loadFontPreview = async () => {
            const isCustom = previewFont.includes('/uploads/');
            const previewEl = document.getElementById(`font-preview-${type}`);
            
            if (isCustom) {
                const url = previewFont.startsWith('http') ? previewFont : `${API_URL}${previewFont}`;
                const familyName = `Preview-${Date.now()}`; 
                const fontFace = new FontFace(familyName, `url(${url})`);
                try {
                    const loadedFace = await fontFace.load();
                    document.fonts.add(loadedFace);
                    if (previewEl) previewEl.style.fontFamily = familyName;
                } catch (e) {
                    console.error("Failed to load custom font preview", e);
                }
            } else {
                const cleanName = previewFont.split(',')[0].replace(/['"]/g, '');
                const scopedName = `${cleanName}-Preview-${type}`;
                const styleId = `style-preview-${cleanName.replace(/\s+/g, '-')}`;
                if (document.getElementById(styleId)) {
                    if (previewEl) previewEl.style.fontFamily = scopedName;
                    return;
                }

                try {
                    const response = await fetch(`https://fonts.googleapis.com/css2?family=${cleanName.replace(/ /g, '+')}:wght@400;700&display=swap`);
                    let cssText = await response.text();
                    cssText = cssText.replace(
                        new RegExp(`font-family:\\s*['"]?${cleanName}['"]?;`, 'g'), 
                        `font-family: '${scopedName}';`
                    );

                    const style = document.createElement('style');
                    style.id = styleId;
                    style.textContent = cssText;
                    document.head.appendChild(style);

                    if (previewEl) previewEl.style.fontFamily = scopedName;
                } catch (error) {
                    console.error("Failed to fetch Google Font CSS for preview isolation:", error);
                    const linkId = `google-font-preview-${cleanName.replace(/\s+/g, '-')}`;
                    if (!document.getElementById(linkId)) {
                        const link = document.createElement('link');
                        link.id = linkId;
                        link.href = `https://fonts.googleapis.com/css2?family=${cleanName.replace(/ /g, '+')}:wght@400;700&display=swap`;
                        link.rel = 'stylesheet';
                        document.head.appendChild(link);
                    }
                    if (previewEl) previewEl.style.fontFamily = cleanName;
                }
            }
        };
        loadFontPreview();
    }, [previewFont, type]);

    const isAnySectionOpen = sections.custom || sections.google;
    const containerStyle = {
        border: '1px solid var(--platform-border-color)',
        borderRadius: '12px',
        background: 'var(--platform-card-bg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '460px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
    };
    const headerStyle = {
        padding: '16px',
        borderBottom: '1px solid var(--platform-border-color)',
        background: 'var(--platform-bg)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box'
    };
    const bodyStyle = {
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
    };
    
    const listStyle = {
        width: '45%',
        borderRight: '1px solid var(--platform-border-color)',
        overflowY: isAnySectionOpen ? 'auto' : 'hidden',
        display: 'block', 
        background: 'var(--platform-card-bg)'
    };

    const previewAreaStyle = {
        width: '55%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--platform-bg)',
        textAlign: 'center',
        position: 'relative',
        color: 'var(--platform-text-primary)'
    };
    const sectionHeaderStyle = {
        padding: '12px 16px',
        background: 'var(--platform-bg)',
        color: 'var(--platform-text-primary)', 
        fontSize: '0.8rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid var(--platform-border-color)',
        borderTop: '1px solid var(--platform-border-color)',
        cursor: 'pointer', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        transition: 'background 0.2s'
    };
    const renderArrow = (isOpen) => (
        <div style={{ 
            transition: 'transform 0.2s ease', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.6
        }}>
            <ChevronDown size={16} />
        </div>
    );

    return (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600', color: 'var(--platform-text-primary)', fontSize: '0.95rem' }}>
                <Type size={16} />
                {label}
            </label>
            
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                        <div style={{ 
                            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', 
                            color: 'var(--platform-text-secondary)', pointerEvents: 'none'
                        }}>
                            <Search size={16} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Пошук шрифту..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px',
                                border: '1px solid var(--platform-border-color)', fontSize: '0.9rem',
                                background: 'var(--platform-card-bg)', color: 'var(--platform-text-primary)',
                                outline: 'none', height: '36px', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    
                    <Button 
                        size="sm" 
                        onClick={() => setIsMediaModalOpen(true)}
                        style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                        <Plus size={16} />
                        Додати
                    </Button>
                </div>

                <div style={bodyStyle}>
                    <div 
                        style={listStyle} 
                        className={`custom-scrollbar font-picker-scroll`}
                    >
                        
                        {customList.length > 0 && (
                            <div 
                                style={{...sectionHeaderStyle, borderTop: 'none'}}
                                onClick={() => toggleSection('custom')}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Folder size={14} style={{ color: '#EAB308' }} />
                                    Власні шрифти ({customList.length})
                                </div>
                                {renderArrow(sections.custom)}
                            </div>
                        )}

                        {sections.custom && customList.map((font) => {
                            const isActive = value === font.value;
                            return (
                                <div 
                                    key={font.listId}
                                    className={`font-item group ${isActive ? 'active' : ''}`}
                                    onMouseEnter={() => setPreviewFont(font.value)}
                                    onClick={() => onChange(font.value)}
                                >
                                    {editingListId === font.listId ? (
                                        <input 
                                            type="text" 
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onClick={e => e.stopPropagation()}
                                            onKeyDown={e => e.key === 'Enter' && saveName(font.listId, e)}
                                            onBlur={(e) => saveName(font.listId, e)}
                                            autoFocus
                                            style={{
                                                width: '100%', padding: '4px 8px', borderRadius: '4px', 
                                                border: '1px solid var(--platform-accent)',
                                                background: 'var(--platform-bg)', color: 'var(--platform-text-primary)'
                                            }}
                                        />
                                    ) : (
                                        <span className="font-label">
                                            {font.label}
                                        </span>
                                    )}

                                    <div className="actions-group">
                                        <button 
                                            onClick={(e) => startEditing(font.listId, font.label, e)}
                                            title="Перейменувати"
                                            className="action-btn"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(font.listId, font.label, e)}
                                            title="Прибрати зі списку"
                                            className="action-btn delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        <div 
                            style={{
                                ...sectionHeaderStyle, 
                                borderTop: customList.length > 0 ? '1px solid var(--platform-border-color)' : 'none'
                            }}
                            onClick={() => toggleSection('google')}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={14} />
                                Стандартні (Google)
                            </div>
                            {renderArrow(sections.google)}
                        </div>

                        {sections.google && googleList.map((font) => {
                            const isActive = value === font.value;
                            return (
                                <div 
                                    key={font.listId}
                                    className={`font-item ${isActive ? 'active' : ''}`}
                                    onMouseEnter={() => setPreviewFont(font.value)}
                                    onClick={() => onChange(font.value)}
                                >
                                    <span className="font-label">{font.label}</span>
                                    {isActive && <Check size={16} />}
                                </div>
                            );
                        })}
                        
                        {googleList.length === 0 && customList.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--platform-text-secondary)', fontSize: '0.85rem' }}>
                                Нічого не знайдено
                            </div>
                        )}
                    </div>

                    <div style={previewAreaStyle}>
                        <div 
                            id={`font-preview-${type}`}
                            style={{ 
                                transition: 'font-family 0.1s ease', wordBreak: 'break-word',
                                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'
                            }}
                        >
                            <h2 style={{ margin: '0 0 16px 0', fontWeight: 'normal', fontSize: '2rem' }}>Aa Bb Cc</h2>
                            <p style={{ fontSize: '3.5rem', margin: 0, fontWeight: 'bold', lineHeight: 1 }}>123</p>
                            <p style={{ fontSize: '0.95rem', margin: '24px 0 0 0', opacity: 0.8, lineHeight: 1.6, maxWidth: '280px', marginInline: 'auto' }}>
                                {type === 'heading' 
                                    ? 'Заголовок привертає увагу та структурує контент на сторінці.' 
                                    : 'Основний текст має бути розбірливим для комфортного читання.'}
                            </p>
                        </div>
                        
                        {previewFont !== value && (
                            <div style={{ marginTop: '20px', animation: 'fadeIn 0.2s ease-out' }}>
                                <Button 
                                    onClick={() => onChange(previewFont)}
                                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                >
                                    Застосувати цей шрифт
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isMediaModalOpen && (
                <MediaPickerModal 
                    isOpen={isMediaModalOpen}
                    onClose={() => setIsMediaModalOpen(false)}
                    onSelect={handleMediaSelect}
                    allowedTypes={['font', 'font/ttf', 'font/otf', '.ttf', '.otf', '.woff', '.woff2']}
                    title="Оберіть файл шрифту"
                />
            )}
            
            <style>{`
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(5px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .font-item { padding: 8px 12px 8px 16px; border-bottom: 1px solid var(--platform-border-color); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; min-height: 42px; color: var(--platform-text-primary); font-size: 0.9rem; background: transparent; }
                .font-item:hover { background: rgba(0,0,0,0.02); }
                .font-item.active { background: var(--platform-accent); color: var(--platform-accent-text); font-weight: 500; }
                .font-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; padding-right: 10px; }
                .actions-group { display: flex; gap: 4px; }
                .action-btn { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: var(--platform-text-secondary); opacity: 0.7; }
                .font-item.active .action-btn { color: currentColor; opacity: 0.9; }
                .font-item:not(.active) .action-btn:hover { background: rgba(255,255,255,0.1); color: var(--platform-text-primary); opacity: 1; }
                .font-item:not(.active) .action-btn.delete:hover { background: rgba(220, 38, 38, 0.15); color: #ef4444; opacity: 1; }
                .font-item.active .action-btn:hover { background: rgba(255, 255, 255, 0.2); opacity: 1; }
                .font-item.active .action-btn.delete:hover { background: #ffffff; color: #dc2626 !important; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                [data-theme='dark'] .font-item:not(.active) .action-btn:hover { background: rgba(255,255,255,0.1); }
                
                .font-picker-scroll::-webkit-scrollbar-track {
                    background: transparent !important;
                }
                .font-picker-scroll {
                    scrollbar-gutter: auto !important;
                }
            `}</style>
        </div>
    );
};

export default FontPicker;