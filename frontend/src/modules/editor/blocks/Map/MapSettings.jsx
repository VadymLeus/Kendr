// frontend/src/modules/editor/blocks/Map/MapSettings.jsx
import React from 'react';
import { commonStyles, SectionTitle } from '../../ui/configuration/SettingsUI';
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
        <div className="flex flex-col gap-6">
            <div>
                <SectionTitle icon={<Code size={18}/>}>Код карти</SectionTitle>
                
                <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                        <label style={{...commonStyles.label, marginBottom: 0}}>HTML код (iframe)</label>
                        {data.embed_code && (
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => updateData({ embed_code: '' })}
                                icon={<Trash2 size={14}/>}
                                className="py-1! px-2! text-xs! h-auto!"
                            >
                                Очистити
                            </Button>
                        )}
                    </div>
                    
                    <textarea
                        name="embed_code"
                        className="custom-scrollbar custom-input min-h-30 font-mono text-[0.85rem] whitespace-pre-wrap resize-y"
                        value={data.embed_code || ''}
                        onChange={(e) => updateData({ embed_code: e.target.value })}
                        placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                        rows="5"
                    />
                    
                    <div className="mt-2 p-2.5 bg-(--platform-bg) rounded-md border border-dashed border-(--platform-border-color) text-xs text-(--platform-text-secondary) leading-snug">
                        <strong>Як додати:</strong>
                        <ol className="pl-4 m-0 mt-1 list-decimal">
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
                <div className="mb-5">
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