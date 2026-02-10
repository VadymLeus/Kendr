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
        <div className="flex flex-col gap-6">
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
                <div className="mb-5">
                    <FontSelector 
                        value={data.titleFontFamily}
                        onChange={(val) => updateData({ titleFontFamily: val })}
                        label="Шрифт заголовків"
                        siteFonts={currentSiteFonts}
                    />
                </div>
                <div className="mb-5">
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
                <div className="flex flex-col gap-2">
                    {(data.items || []).map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div 
                                key={item.id || index} 
                                className={`
                                    rounded-lg bg-(--platform-card-bg) overflow-hidden transition-all duration-200 border
                                    ${isOpen ? 'border-(--platform-accent)' : 'border-(--platform-border-color)'}
                                `}
                            >
                                <div 
                                    onClick={() => toggleItem(index)}
                                    className={`
                                        flex items-center justify-between px-3 py-2.5 cursor-pointer
                                        ${isOpen ? 'bg-(--platform-bg) border-b border-(--platform-border-color)' : 'bg-transparent'}
                                    `}
                                >
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                        <div className={`
                                            transition-transform duration-200
                                            ${isOpen ? 'text-(--platform-accent) rotate-180' : 'text-(--platform-text-secondary) rotate-0'}
                                        `}>
                                            <ChevronDown size={16} />
                                        </div>
                                        <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                            {item.title}
                                        </span>
                                    </div>
                                    <Button 
                                        variant="danger" 
                                        size="sm"
                                        onClick={(e) => requestDelete(e, index)}
                                        icon={<Trash2 size={14}/>}
                                        className="w-7! h-7! p-0!"
                                    />
                                </div>
                                {isOpen && (
                                    <div className="p-3 flex flex-col gap-3">
                                        <Input
                                            label="Питання / Заголовок"
                                            value={item.title}
                                            onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                                            placeholder="Введіть питання"
                                        />
                                        <div className="mb-0">
                                            <label style={commonStyles.label}>Відповідь / Вміст</label>
                                            <textarea
                                                className="custom-input custom-scrollbar w-full min-h-25 resize-y leading-relaxed"
                                                value={item.content}
                                                onChange={(e) => handleItemChange(index, 'content', e.target.value)}
                                                placeholder="Введіть розгорнуту відповідь..."
                                            />
                                        </div>
                                        <div className="border-t border-(--platform-border-color) pt-3">
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
                    className="w-full mt-4"
                    icon={<Plus size={18} />}
                >
                    Додати елемент
                </Button>
            </div>
        </div>
    );
};

export default AccordionSettings;