// frontend/src/modules/editor/blocks/Header/HeaderSettings.jsx
import React, { useState } from 'react';
import { generateBlockId } from '../../core/editorConfig';
import { commonStyles, ToggleGroup, ToggleSwitch, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import RangeSlider from '../../../../shared/ui/elements/RangeSlider';
import ConfirmModal from '../../../../shared/ui/complex/ConfirmModal';
import AlignmentControl from '../../ui/components/AlignmentControl';
import ButtonEditor from '../../ui/components/ButtonEditor';
import FontSelector from '../../ui/components/FontSelector';
import UniversalMediaInput from '../../../../shared/ui/complex/UniversalMediaInput';
import { Trash2, Plus, Image, Type, LayoutTemplate, List, Link as LinkIcon, Pencil, Crop } from 'lucide-react';

const HeaderSettings = ({ data, onChange, siteData }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const MAX_NAV_ITEMS = 5;
    const navItemsCount = (data.nav_items || []).length;
    const isLimitReached = navItemsCount >= MAX_NAV_ITEMS;
    const updateData = (updates) => onChange({ ...data, ...updates });
    const handleNavItemChange = (id, field, value) => {
        const newItems = data.nav_items.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        );
        updateData({ nav_items: newItems });
    };

    const addNavItem = () => {
        if (isLimitReached) return;
        const newItem = { id: generateBlockId(), label: 'Нова сторінка', link: '/' };
        updateData({ nav_items: [...(data.nav_items || []), newItem] });
    };

    const requestDelete = (id) => {
        setItemToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDeleteId) {
            updateData({ nav_items: data.nav_items.filter(item => item.id !== itemToDeleteId) });
        }
        setIsDeleteModalOpen(false);
        setItemToDeleteId(null);
    };

    const handleLogoChange = (val) => {
        const newValue = val?.target ? val.target.value : val;
        updateData({ logo_src: newValue });
    };

    const currentLogoRadius = data.logo_radius !== undefined ? data.logo_radius : (data.borderRadius || 0);
    return (
        <div className="flex flex-col gap-6">
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="Видалити пункт меню?"
                message="Цю дію не можна скасувати."
                confirmLabel="Видалити"
                cancelLabel="Скасувати"
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                type="danger"
            />
            <div>
                <SectionTitle icon={<Image size={18}/>}>Логотип та Назва</SectionTitle>
                <div className="mb-5">
                    <label style={commonStyles.label}>Центральний логотип</label>
                    <div className="bg-(--platform-bg) p-3 rounded-xl border border-(--platform-border-color)">
                        <div className="w-full h-50">
                            <UniversalMediaInput 
                                type="image"
                                value={data.logo_src} 
                                onChange={handleLogoChange} 
                                aspect={data.aspectRatio === 1 ? 1 : null}
                            />
                        </div>
                    </div>
                </div>
                <div className="mb-5">
                    <ToggleGroup 
                        options={[
                            { value: 'small', label: 'S' },
                            { value: 'medium', label: 'M' },
                            { value: 'large', label: 'L' },
                        ]}
                        value={data.logo_size || 'medium'}
                        onChange={(val) => updateData({ logo_size: val })}
                    />
                </div>
                <div className="mb-5">
                    <RangeSlider 
                        label="Скруглення логотипу"
                        value={currentLogoRadius}
                        onChange={(val) => updateData({ logo_radius: val })}
                        min={0}
                        max={50}
                        unit="px"
                    />
                </div>
                <div className="mb-5">
                    <Input 
                        label="Назва сайту"
                        value={data.site_title || ''}
                        onChange={(e) => updateData({ site_title: e.target.value })}
                        leftIcon={<Type size={16}/>}
                    />
                </div>
                <ToggleSwitch 
                    checked={data.show_title || false}
                    onChange={(checked) => updateData({ show_title: checked })}
                    label="Показувати назву поруч з лого"
                />
            </div>
            <div>
                <SectionTitle icon={<Crop size={16}/>}>Формат логотипу</SectionTitle>
                <div className="mb-5">
                      <ToggleSwitch 
                        label="Квадратне зображення (1:1)"
                        checked={data.aspectRatio === 1}
                        onChange={(val) => updateData({ aspectRatio: val ? 1 : null })}
                      />
                      <div className="text-xs text-(--platform-text-secondary) mt-1.5 leading-snug">
                        {data.aspectRatio === 1 
                            ? "При завантаженні буде запропоновано обрізати логотип під квадрат." 
                            : "Логотип відображатиметься в оригінальних пропорціях."}
                      </div>
                </div>
            </div>
            
            <div>
                <SectionTitle icon={<LayoutTemplate size={18}/>}>Розміщення та Стиль</SectionTitle>
                <div className="mb-5">
                    <ToggleSwitch 
                        checked={data.is_sticky || false}
                        onChange={(checked) => updateData({ is_sticky: checked })}
                        label="Закріпити при прокрутці"
                    />
                </div>
                <div className="mb-5">
                    <AlignmentControl 
                        label="Вирівнювання меню"
                        value={data.nav_alignment || 'right'}
                        onChange={(val) => updateData({ nav_alignment: val })}
                    />
                </div>
                <div className="mb-5">
                    <label style={commonStyles.label}>Тип відображення</label>
                    <ToggleGroup 
                        options={[
                            { value: 'text', label: 'Текст' },
                            { value: 'button', label: 'Кнопки' },
                        ]}
                        value={data.nav_style || 'text'}
                        onChange={(val) => updateData({ nav_style: val })}
                    />
                </div>
                {data.nav_style === 'button' ? (
                    <div className="mt-4 p-4 bg-(--platform-bg) rounded-lg border border-(--platform-border-color)">
                        <div className="mb-3 font-semibold text-sm">Стиль кнопок меню</div>
                        <ButtonEditor 
                            data={data.buttonSettings || {}}
                            onChange={(val) => updateData({ buttonSettings: val })}
                            siteData={siteData}
                            showAlignment={false} 
                            hideLinks={true}      
                            hideIcons={true}
                            hideText={true}
                        />
                    </div>
                ) : (
                    <div className="mb-5">
                        <FontSelector 
                            label="Шрифт меню"
                            value={data.nav_fontFamily}
                            onChange={(val) => updateData({ nav_fontFamily: val })}
                            siteFonts={siteData?.theme_settings}
                        />
                    </div>
                )}
            </div>
            <div>
                <div className="flex items-center justify-between mb-3">
                    <SectionTitle icon={<List size={18}/>} style={{marginBottom: 0}}>Пункти меню</SectionTitle>
                    <span 
                        className={`
                            text-xs font-semibold px-2 py-0.5 rounded
                            ${isLimitReached ? 'text-(--platform-danger) bg-red-500/10' : 'text-(--platform-text-secondary) bg-(--platform-bg)'}
                        `}
                    >
                        {navItemsCount} / {MAX_NAV_ITEMS}
                    </span>
                </div>
                <div className="mb-3 p-2 bg-blue-500/10 text-(--platform-accent) rounded-md text-xs leading-snug">
                    <strong>Формат посилань:</strong>
                    <ul className="m-1 ml-4 p-0 list-disc">
                        <li><code className="bg-black/5 px-1 rounded">/page</code> - внутрішня сторінка</li>
                        <li><code className="bg-black/5 px-1 rounded">#blockId</code> - якір (скрол до блоку)</li>
                    </ul>
                </div>
                <div className="flex flex-col gap-3">
                    {data.nav_items && data.nav_items.map((item, idx) => (
                        <div key={item.id} className="relative bg-(--platform-card-bg) p-3 rounded-xl border border-(--platform-border-color) flex flex-col gap-3 transition-all hover:border-(--platform-accent)/40">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-(--platform-text-secondary) flex items-center gap-1.5">
                                    <List size={14} /> Пункт {idx + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => requestDelete(item.id)}
                                    className="text-(--platform-text-secondary) hover:text-(--platform-danger) hover:bg-red-500/10 p-1.5 rounded-md transition-colors"
                                    title="Видалити"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Input 
                                    value={item.label} 
                                    onChange={(e) => handleNavItemChange(item.id, 'label', e.target.value)}
                                    placeholder="Назва"
                                    leftIcon={<Pencil size={14}/>}
                                />
                                <Input 
                                    value={item.link} 
                                    onChange={(e) => handleNavItemChange(item.id, 'link', e.target.value)}
                                    placeholder="/page"
                                    leftIcon={<LinkIcon size={14}/>}
                                    style={{fontFamily: 'monospace'}}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <Button 
                    variant="outline"
                    onClick={addNavItem}
                    disabled={isLimitReached}
                    className={`
                        w-full mt-2 transition-opacity
                        ${isLimitReached ? 'border-(--platform-border-color) text-(--platform-text-secondary) opacity-60 cursor-not-allowed' : 'border-(--platform-accent) text-(--platform-accent) cursor-pointer'}
                    `}
                    icon={<Plus size={16} />}
                >
                    {isLimitReached ? 'Ліміт досягнуто' : 'Додати пункт меню'}
                </Button>
            </div>
        </div>
    );
};

export default HeaderSettings;