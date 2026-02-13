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
import { BASE_URL } from '../../../../shared/config';
import { Trash2, Plus, Image, Type, LayoutTemplate, List, Link, Pencil, AlertCircle, Upload } from 'lucide-react';

const HeaderSettings = ({ data, onChange, siteData }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
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

    const getLogoUrl = (src) => {
        if (!src) return '';
        if (src.startsWith('http')) return src;
        return `${BASE_URL}${src}`;
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
                                aspect={1}
                                triggerStyle={{ width: '100%', height: '100%', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                            >
                                <div 
                                    className="w-full h-full flex items-center justify-center relative rounded-lg overflow-hidden bg-(--platform-card-bg) border border-dashed border-(--platform-border-color)"
                                    onMouseEnter={() => setIsLogoHovered(true)}
                                    onMouseLeave={() => setIsLogoHovered(false)}
                                >
                                    {data.logo_src ? (
                                        <>
                                            <img 
                                                src={getLogoUrl(data.logo_src)} 
                                                alt="Logo" 
                                                className="max-w-[80%] max-h-[80%] object-contain transition-all duration-200"
                                                style={{ borderRadius: `${currentLogoRadius}px` }} 
                                            />
                                            <div 
                                                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 backdrop-blur-[2px] ${isLogoHovered ? 'opacity-100' : 'opacity-0'}`}
                                            >
                                                <div className="text-white flex gap-2 items-center font-medium">
                                                    <Upload size={18} /> Змінити
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleLogoChange(''); }}
                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white border-none flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                                                    title="Видалити"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-(--platform-text-secondary) opacity-60">
                                            <Image size={32} />
                                            <span className="text-sm">Завантажити лого</span>
                                        </div>
                                    )}
                                </div>
                            </UniversalMediaInput>
                        </div>
                    </div>
                </div>
                <div className="mb-5">
                    <label style={commonStyles.label}>Розмір логотипу</label>
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
                        label="Назва сайту (текст)"
                        value={data.site_title}
                        onChange={(e) => updateData({ site_title: e.target.value })}
                        leftIcon={<Type size={16}/>}
                    />
                </div>
                <ToggleSwitch 
                    checked={data.show_title}
                    onChange={(checked) => updateData({ show_title: checked })}
                    label="Показувати назву поруч з лого"
                />
            </div>
            <div className="text-xs text-(--platform-text-secondary) leading-snug flex gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-(--platform-accent)" />
                <span>Логотип і назву сайту синхронізовано глобальними налаштуваннями.</span>
            </div>
            <div>
                <SectionTitle icon={<LayoutTemplate size={18}/>}>Розміщення та Стиль</SectionTitle>
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
                <div className="flex flex-col gap-2">
                    {data.nav_items && data.nav_items.map((item) => (
                        <div key={item.id} className="flex gap-2 items-start bg-(--platform-card-bg) p-2.5 rounded-lg border border-(--platform-border-color)">
                            <div className="flex-1 flex flex-col gap-2">
                                <Input 
                                    value={item.label} 
                                    onChange={(e) => handleNavItemChange(item.id, 'label', e.target.value)}
                                    placeholder="Назва"
                                    leftIcon={<Pencil size={14}/>}
                                    style={{fontSize: '0.9rem', padding: '8px 8px 8px 36px'}}
                                />
                                <Input 
                                    value={item.link} 
                                    onChange={(e) => handleNavItemChange(item.id, 'link', e.target.value)}
                                    placeholder="/page"
                                    leftIcon={<Link size={14}/>}
                                    style={{fontSize: '0.85rem', padding: '8px 8px 8px 36px', fontFamily: 'monospace'}}
                                />
                            </div>
                            <Button 
                                variant="danger"
                                size="sm"
                                onClick={() => requestDelete(item.id)}
                                title="Видалити"
                                className="h-auto! p-1.5!"
                            >
                                <Trash2 size={16} />
                            </Button>
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