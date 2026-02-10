// frontend/src/modules/editor/blocks/Features/FeaturesSettings.jsx
import React, { useState } from 'react';
import { useConfirm } from '../../../../shared/hooks/useConfirm';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import { commonStyles, SectionTitle, ToggleGroup, ToggleSwitch } from '../../ui/configuration/SettingsUI';
import FontSelector from '../../ui/components/FontSelector';
import AlignmentControl from '../../ui/components/AlignmentControl';
import { generateBlockId } from '../../core/editorConfig';
import { List, Grid, Trash2, Plus, Star, Zap, Shield, Truck, Gift, Clock, Phone, Settings, User, Globe, Heart, ShoppingBag, Check, Type } from 'lucide-react';

const CONFIG = {
  MAX_ITEMS: 8,
  DEFAULT_DATA: {
    title: 'Наші переваги',
    items: [],
    columns: 2,
    layout: 'cards',
    align: 'center',
    borderRadius: '8px',
    showIconBackground: false,
    titleFontFamily: 'global',
    contentFontFamily: 'global'
  },
  LAYOUT_OPTIONS: [
    { value: 'cards', label: 'Картки' },
    { value: 'minimal', label: 'Мінімалізм' },
    { value: 'list', label: 'Список' }
  ],
  COLUMN_OPTIONS: [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' }
  ],
};

const ICON_OPTIONS = [
  { key: 'star', icon: <Star size={20} /> },
  { key: 'zap', icon: <Zap size={20} /> },
  { key: 'shield', icon: <Shield size={20} /> },
  { key: 'truck', icon: <Truck size={20} /> },
  { key: 'gift', icon: <Gift size={20} /> },
  { key: 'clock', icon: <Clock size={20} /> },
  { key: 'phone', icon: <Phone size={20} /> },
  { key: 'settings', icon: <Settings size={20} /> },
  { key: 'user', icon: <User size={20} /> },
  { key: 'globe', icon: <Globe size={20} /> },
  { key: 'heart', icon: <Heart size={20} /> },
  { key: 'shop', icon: <ShoppingBag size={20} /> }
];

const FeaturesSettings = ({ data, onChange, siteData }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const { confirm } = useConfirm();
  const normalizedData = {
    ...CONFIG.DEFAULT_DATA,
    ...data
  };

  const themeSettings = siteData?.theme_settings || {};
  const currentSiteFonts = {
      heading: themeSettings.font_heading,
      body: themeSettings.font_body
  };
  
  const updateData = (updates) => {
    onChange({ ...normalizedData, ...updates });
  };
  
  const handleFeatureChange = (index, field, value) => {
    const newItems = normalizedData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateData({ items: newItems });
  };
  
  const handleAddFeature = () => {
    if (normalizedData.items.length >= CONFIG.MAX_ITEMS) return;
    const newItem = {
      id: generateBlockId(),
      icon: 'star',
      title: 'Перевага',
      text: 'Опис переваги'
    };
    
    updateData({ items: [...normalizedData.items, newItem] });
    setOpenIndex(normalizedData.items.length);
  };
  
  const handleRemoveFeature = async (e, index) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: "Видалити елемент?",
      message: `Видалити "${normalizedData.items[index].title}"?`,
      type: "danger",
      confirmLabel: "Видалити"
    });
    
    if (isConfirmed) {
      updateData({ 
        items: normalizedData.items.filter((_, i) => i !== index) 
      });
      setOpenIndex(null);
    }
  };
  
  const getIconComponent = (key) => {
    const option = ICON_OPTIONS.find(o => o.key === key);
    return option ? option.icon : <Star size={18} />;
  };
  
  const isMaxItemsReached = normalizedData.items.length >= CONFIG.MAX_ITEMS;
  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <SectionTitle icon={<Grid size={16} />}>
          Загальні
        </SectionTitle>
        <Input
          label="Заголовок блоку"
          value={normalizedData.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Введіть заголовок"
        />
      </div>

      <div>
        <SectionTitle icon={<Type size={16} />}>
          Типографіка
        </SectionTitle>
        <div className="mb-5">
            <FontSelector 
                value={normalizedData.titleFontFamily}
                onChange={(val) => updateData({ titleFontFamily: val })}
                label="Шрифт заголовку"
                siteFonts={currentSiteFonts}
            />
        </div>
        <div className="mb-5">
            <FontSelector 
                value={normalizedData.contentFontFamily}
                onChange={(val) => updateData({ contentFontFamily: val })}
                label="Шрифт контенту"
                siteFonts={currentSiteFonts}
            />
        </div>
      </div>

      <div>
        <SectionTitle icon={<List size={16} />}>
          Макет та Вигляд
        </SectionTitle>
        
        <div className="mb-5">
          <label style={commonStyles.label}>Стиль відображення</label>
          <ToggleGroup
            options={CONFIG.LAYOUT_OPTIONS}
            value={normalizedData.layout}
            onChange={(val) => updateData({ layout: val })}
          />
        </div>
        
        <div className="mb-5">
          <label style={commonStyles.label}>Кількість колонок</label>
          <ToggleGroup
            options={CONFIG.COLUMN_OPTIONS}
            value={normalizedData.columns}
            onChange={(val) => updateData({ columns: val })}
          />
        </div>
        
        {normalizedData.layout !== 'list' && (
           <AlignmentControl
              label="Вирівнювання тексту"
              value={normalizedData.align}
              onChange={(val) => updateData({ align: val })}
           />
        )}
      </div>
      
      <div>
        <SectionTitle icon={<Check size={16} />}>
          Стилізація
        </SectionTitle>
        
        <div className="mb-5">
          <ToggleSwitch
            checked={normalizedData.showIconBackground}
            onChange={(val) => updateData({ showIconBackground: val })}
            label="Фон для іконок (кружечок)"
          />
        </div>
      </div>
      
      <div>
        <SectionTitle>
          Елементи ({normalizedData.items.length}/{CONFIG.MAX_ITEMS})
        </SectionTitle>
        {normalizedData.items.map((item, index) => (
          <FeatureItem
            key={item.id || index}
            item={item}
            index={index}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            onRemove={handleRemoveFeature}
            onChange={handleFeatureChange}
            iconOptions={ICON_OPTIONS}
            getIconComponent={getIconComponent}
          />
        ))}
        
        <button
          type="button"
          onClick={handleAddFeature}
          disabled={isMaxItemsReached}
          className={`
            w-full p-3 flex items-center justify-center gap-2 bg-transparent border border-dashed border-(--platform-border-color) rounded-lg 
            text-(--platform-text-secondary) font-medium transition-all duration-200 
            ${isMaxItemsReached ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-(--platform-accent) hover:text-(--platform-accent) hover:bg-transparent'}
          `}
        >
          <Plus size={18} />
          Додати перевагу
        </button>
      </div>
    </div>
  );
};

const FeatureItem = ({ item, index, isOpen, onToggle, onRemove, onChange, iconOptions, getIconComponent }) => {
  return (
    <div
      className={`
        border rounded-lg mb-3 bg-(--platform-card-bg) overflow-hidden transition-colors duration-200
        ${isOpen ? 'border-(--platform-accent)' : 'border-(--platform-border-color) hover:border-(--platform-accent)'}
      `}
    >
      <div 
        className="flex justify-between items-center px-4 py-3 cursor-pointer bg-(--platform-bg) border-b border-transparent transition-colors duration-200" 
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <div className="text-(--platform-accent) flex bg-(--platform-card-bg) p-1.5 rounded-md border border-(--platform-border-color)">
            {getIconComponent(item.icon)}
          </div>
          <span className="font-medium text-sm">
            {item.title}
          </span>
        </div>
        
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => onRemove(e, index)}
          className="w-7! h-7! opacity-60 p-0!"
          title="Видалити"
        >
          <Trash2 size={14} />
        </Button>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t border-(--platform-border-color)">
          <div className="mb-5">
            <label style={commonStyles.label}>Виберіть іконку</label>
            <div className="grid grid-cols-4 gap-2 w-full">
              {iconOptions.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  className={`
                    w-full aspect-square flex items-center justify-center rounded-lg border bg-transparent cursor-pointer transition-all duration-200
                    ${item.icon === opt.key 
                        ? 'border-(--platform-accent) text-(--platform-accent) ring-1 ring-(--platform-accent)' 
                        : 'border-(--platform-border-color) text-(--platform-text-secondary) hover:border-(--platform-accent) hover:text-(--platform-accent)'
                    }
                  `}
                  onClick={() => onChange(index, 'icon', opt.key)}
                  title={opt.key}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>
          
          <Input
            label="Заголовок"
            value={item.title}
            onChange={(e) => onChange(index, 'title', e.target.value)}
            placeholder="Назва переваги"
          />
          <div className="mb-5">
            <label style={commonStyles.label}>Опис</label>
            <textarea
              value={item.text}
              onChange={(e) => onChange(index, 'text', e.target.value)}
              style={{ ...commonStyles.textarea, minHeight: '80px' }}
              className="custom-scrollbar"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesSettings;