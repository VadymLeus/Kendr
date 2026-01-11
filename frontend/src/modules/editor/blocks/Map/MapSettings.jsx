// frontend/src/modules/editor/blocks/Map/MapSettings.jsx
import React from 'react';
import { commonStyles, SectionTitle } from '../../controls/SettingsUI';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { Button } from '../../../../shared/ui/elements/Button';
import { MapPin, Maximize, Trash2, Code } from 'lucide-react';

const MapSettings = ({ data, onChange }) => {
    const updateData = (updates) => onChange({ ...data, ...updates });
    const sizeOptions = [
        { value: 'small', label: 'Маленька (400px)' },
        { value: 'medium', label: 'Середня (650px)' },
        { value: 'large', label: 'На всю ширину' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <SectionTitle icon={<Code size={18}/>}>Код карти</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{...commonStyles.label, marginBottom: 0}}>HTML код (iframe)</label>
                        {data.embed_code && (
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => updateData({ embed_code: '' })}
                                icon={<Trash2 size={14}/>}
                                style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
                            >
                                Очистити
                            </Button>
                        )}
                    </div>
                    
                    <textarea
                        name="embed_code"
                        className="custom-scrollbar"
                        value={data.embed_code || ''}
                        onChange={(e) => updateData({ embed_code: e.target.value })}
                        style={{
                            ...commonStyles.textarea,
                            minHeight: '120px',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            whiteSpace: 'pre-wrap'
                        }}
                        placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                        rows="5"
                    />
                    
                    <div style={{ 
                        marginTop: '8px', 
                        padding: '10px', 
                        background: 'var(--platform-bg)', 
                        borderRadius: '6px',
                        border: '1px dashed var(--platform-border-color)',
                        fontSize: '0.75rem',
                        color: 'var(--platform-text-secondary)',
                        lineHeight: '1.4'
                    }}>
                        <strong>Як додати:</strong>
                        <ol style={{ paddingLeft: '16px', margin: '4px 0 0 0' }}>
                            <li>Відкрийте Google Maps.</li>
                            <li>Знайдіть локацію та натисніть <strong>Поділитися</strong>.</li>
                            <li>Виберіть <strong>Вбудувати карту</strong>.</li>
                            <li>Скопіюйте HTML-код та вставте вище.</li>
                        </ol>
                    </div>
                </div>
            </div>
            
            <div>
                <SectionTitle icon={<Maximize size={18}/>}>Розмір та Вигляд</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Ширина блоку</label>
                    <CustomSelect
                        value={data.sizePreset || 'medium'}
                        onChange={(e) => updateData({ sizePreset: e.target.value })}
                        options={sizeOptions}
                        leftIcon={<MapPin size={16}/>}
                    />
                </div>
            </div>
        </div>
    );
};

export default MapSettings;