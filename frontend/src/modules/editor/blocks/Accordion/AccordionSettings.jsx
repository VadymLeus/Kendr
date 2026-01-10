// frontend/src/modules/editor/blocks/Accordion/AccordionSettings.jsx
import React, { useState } from 'react';
import { generateBlockId, FONT_LIBRARY } from '../../core/editorConfig';
import { commonStyles, SectionTitle } from '../../controls/SettingsUI';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { Button } from '../../../../shared/ui/elements/Button';
import { Input } from '../../../../shared/ui/elements/Input';
import { IconPlus, IconTrash, IconChevronDown, IconChevronUp, IconList, IconType, IconFileText, IconFont } from '../../../../shared/ui/elements/Icons';
import ConfirmModal from '../../../../shared/ui/complex/ConfirmModal';

const AccordionSettings = ({ data, onChange }) => {
    const [openIndex, setOpenIndex] = useState(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDeleteIndex, setItemToDeleteIndex] = useState(null);

    const updateData = (newData) => onChange({ ...data, ...newData });

    const handleItemChange = (index, field, value) => {
        const newItems = data.items.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        );
        updateData({ items: newItems });
    };

    const handleFontChange = (e) => {
        updateData({ fontFamily: e.target.value });
    };

    const handleAddItem = () => {
        const newItem = { 
            id: generateBlockId(), 
            title: 'Нове питання', 
            content: 'Тут буде відповідь...' 
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
                <SectionTitle icon={<IconType size={18}/>}>Загальні налаштування</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Шрифт блоку</label>
                    <CustomSelect
                        value={data.fontFamily || 'global'}
                        onChange={handleFontChange}
                        options={FONT_LIBRARY}
                        leftIcon={<IconFont size={16}/>}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<IconList size={18}/>}>Елементи списку</SectionTitle>
                
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
                                            <IconChevronDown size={16} />
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
                                        icon={<IconTrash size={14}/>}
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
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <Button 
                    onClick={handleAddItem}
                    style={{ width: '100%', marginTop: '16px' }}
                    icon={<IconPlus size={18} />}
                >
                    Додати елемент
                </Button>
            </div>
        </div>
    );
};

export default AccordionSettings;