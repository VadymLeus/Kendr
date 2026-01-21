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

const STYLES = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' },
  itemWrapper: { border: '1px solid var(--platform-border-color)', borderRadius: '8px', marginBottom: '0.75rem', background: 'var(--platform-card-bg)', overflow: 'hidden', transition: 'border-color 0.2s ease' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', cursor: 'pointer', background: 'var(--platform-bg)', borderBottom: '1px solid transparent', transition: 'background 0.2s' },
  iconPreview: { color: 'var(--platform-accent)', display: 'flex', background: 'var(--platform-card-bg)', padding: '6px', borderRadius: '6px', border: '1px solid var(--platform-border-color)' },
  itemContent: { padding: '16px', borderTop: '1px solid var(--platform-border-color)' },
  iconGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '100%' },
  iconButton: { width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--platform-border-color)', background: 'transparent', color: 'var(--platform-text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease' },
  addButton: { width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', border: '1px dashed var(--platform-border-color)', borderRadius: '8px', color: 'var(--platform-text-secondary)', fontWeight: '500', transition: 'all 0.2s' }
};

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

const customStyles = `
  .settings-hover-item:hover { border-color: var(--platform-accent) !important; }
  .settings-hover-btn:hover { border-color: var(--platform-accent) !important; color: var(--platform-accent) !important; background-color: transparent !important; }
  .icon-grid-btn { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid var(--platform-border-color); background: transparent; color: var(--platform-text-secondary); cursor: pointer; transition: all 0.2s ease; }
  .icon-grid-btn:hover { border-color: var(--platform-accent) !important; color: var(--platform-accent); }
  .icon-grid-btn.active { border-color: var(--platform-accent); color: var(--platform-accent); box-shadow: 0 0 0 1px var(--platform-accent); }
`;

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
    <div style={STYLES.container}>
      <style>{customStyles}</style>
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
        <div style={commonStyles.formGroup}>
            <FontSelector 
                value={normalizedData.titleFontFamily}
                onChange={(val) => updateData({ titleFontFamily: val })}
                label="Шрифт заголовку"
                siteFonts={currentSiteFonts}
            />
        </div>
        <div style={commonStyles.formGroup}>
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
        
        <div style={commonStyles.formGroup}>
          <label style={commonStyles.label}>Стиль відображення</label>
          <ToggleGroup
            options={CONFIG.LAYOUT_OPTIONS}
            value={normalizedData.layout}
            onChange={(val) => updateData({ layout: val })}
          />
        </div>
        
        <div style={commonStyles.formGroup}>
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
        
        <div style={commonStyles.formGroup}>
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
          className="settings-hover-btn"
          style={{
            ...STYLES.addButton,
            cursor: isMaxItemsReached ? 'not-allowed' : 'pointer',
            opacity: isMaxItemsReached ? 0.5 : 1
          }}
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
      style={{ ...STYLES.itemWrapper, borderColor: isOpen ? 'var(--platform-accent)' : 'var(--platform-border-color)' }}
      className="settings-hover-item"
    >
      <div style={STYLES.itemHeader} onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={STYLES.iconPreview}>
            {getIconComponent(item.icon)}
          </div>
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>
            {item.title}
          </span>
        </div>
        
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => onRemove(e, index)}
          style={{ width: '28px', height: '28px', opacity: 0.6, padding: 0 }}
          title="Видалити"
        >
          <Trash2 size={14} />
        </Button>
      </div>
      
      {isOpen && (
        <div style={STYLES.itemContent}>
          <div style={commonStyles.formGroup}>
            <label style={commonStyles.label}>Виберіть іконку</label>
            <div style={STYLES.iconGrid}>
              {iconOptions.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  className={`icon-grid-btn ${item.icon === opt.key ? 'active' : ''}`}
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
          
          <div style={commonStyles.formGroup}>
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