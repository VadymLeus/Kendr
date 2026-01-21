// frontend/src/modules/editor/blocks/Accordion/AccordionSettings.jsx
import React, { useState } from 'react';
import { generateBlockId } from '../../core/editorConfig';
import { commonStyles, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Button } from '../../../../shared/ui/elements/Button';
import { Input } from '../../../../shared/ui/elements/Input';
import Switch from '../../../../shared/ui/elements/Switch';
import FontSelector from '../../ui/components/FontSelector';
import ConfirmModal from '../../../../shared/ui/complex/ConfirmModal';
import { Plus, Trash2, ChevronDown, List, Type } from 'lucide-react';

const AccordionSettings = ({ data, onChange, siteData }) => {
    const [openIndex, setOpenIndex] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDeleteIndex, setItemToDeleteIndex] = useState(null);
    const themeSettings = siteData?.theme_settings || {};
    const currentSiteFonts = {
        heading: themeSettings.font_heading,
        body: themeSettings.font_body
    };

    const updateData = (newData) => onChange({ ...data, ...newData });

    const handleItemChange = (index, field, value) => {
        const newItems = data.items.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        );
        updateData({ items: newItems });
    };

    const handleAddItem = () => {
        const newItem = { 
            id: generateBlockId(), 
            title: 'Нове питання', 
            content: 'Тут буде відповідь...',
            isOpenDefault: false
        };
        const newItems = [...(data.items || []), newItem];
        updateData({ items: newItems });
        setOpenIndex(newItems.length - 1); 
    };

    const requestDelete = (e, index) => {
        e.stopPropagation();
        setItemToDeleteIndex(index);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDeleteIndex !== null) {
            const newItems = data.items.filter((_, i) => i !== itemToDeleteIndex);
            updateData({ items: newItems });
            if (openIndex === itemToDeleteIndex) setOpenIndex(null);
        }
        setIsDeleteModalOpen(false);
        setItemToDeleteIndex(null);
    };

    const toggleItem = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Видалити елемент?"
                message="Цю дію не можна скасувати."
                confirmLabel="Видалити"
                cancelLabel="Скасувати"
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                type="danger"
            />

            <div>
                <SectionTitle icon={<Type size={18}/>}>Типографіка</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <FontSelector 
                        value={data.titleFontFamily}
                        onChange={(val) => updateData({ titleFontFamily: val })}
                        label="Шрифт заголовків"
                        siteFonts={currentSiteFonts}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <FontSelector 
                        value={data.contentFontFamily}
                        onChange={(val) => updateData({ contentFontFamily: val })}
                        label="Шрифт тексту"
                        siteFonts={currentSiteFonts}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<List size={18}/>}>Елементи списку</SectionTitle>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(data.items || []).map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div 
                                key={item.id || index} 
                                style={{
                                    border: isOpen ? '1px solid var(--platform-accent)' : '1px solid var(--platform-border-color)',
                                    borderRadius: '8px',
                                    background: 'var(--platform-card-bg)',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div 
                                    onClick={() => toggleItem(index)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 12px',
                                        background: isOpen ? 'var(--platform-bg)' : 'transparent',
                                        cursor: 'pointer',
                                        borderBottom: isOpen ? '1px solid var(--platform-border-color)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            color: isOpen ? 'var(--platform-accent)' : 'var(--platform-text-secondary)',
                                            transition: 'transform 0.2s',
                                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                        }}>
                                            <ChevronDown size={16} />
                                        </div>
                                        <span style={{ 
                                            fontWeight: 500, 
                                            fontSize: '0.9rem', 
                                            whiteSpace: 'nowrap', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis' 
                                        }}>
                                            {item.title}
                                        </span>
                                    </div>
                                    
                                    <Button 
                                        variant="danger" 
                                        size="sm"
                                        onClick={(e) => requestDelete(e, index)}
                                        icon={<Trash2 size={14}/>}
                                        style={{ width: '28px', height: '28px', padding: 0 }}
                                    />
                                </div>

                                {isOpen && (
                                    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <Input
                                            label="Питання / Заголовок"
                                            value={item.title}
                                            onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                                            placeholder="Введіть питання"
                                        />
                                        
                                        <div style={commonStyles.formGroup}>
                                            <label style={commonStyles.label}>Відповідь / Вміст</label>
                                            <textarea
                                                className="custom-scrollbar"
                                                value={item.content}
                                                onChange={(e) => handleItemChange(index, 'content', e.target.value)}
                                                placeholder="Введіть розгорнуту відповідь..."
                                                style={{
                                                    ...commonStyles.textarea,
                                                    minHeight: '100px',
                                                    resize: 'vertical',
                                                    lineHeight: '1.5'
                                                }}
                                            />
                                        </div>

                                        <div style={{
                                            borderTop: '1px solid var(--platform-border-color)',
                                            paddingTop: '12px'
                                        }}>
                                            <Switch 
                                                label="Розгорнуто за замовчуванням"
                                                checked={item.isOpenDefault || false}
                                                onChange={(checked) => handleItemChange(index, 'isOpenDefault', checked)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <Button 
                    onClick={handleAddItem}
                    style={{ width: '100%', marginTop: '16px' }}
                    icon={<Plus size={18} />}
                >
                    Додати елемент
                </Button>
            </div>
        </div>
    );
};

export default AccordionSettings;