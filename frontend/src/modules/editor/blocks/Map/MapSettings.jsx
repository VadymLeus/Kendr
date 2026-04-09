// frontend/src/modules/editor/blocks/Map/MapSettings.jsx
import React from 'react';
import { commonStyles, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Button } from '../../../../shared/ui/elements/Button';
import { Trash2, Code } from 'lucide-react';

const MapSettings = ({ data, onChange }) => {
    const updateData = (updates) => onChange({ ...data, ...updates });
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
                    <div className="mt-3 p-3.5 bg-black/5 dark:bg-white/5 rounded-xl border border-(--platform-border-color) text-xs text-(--platform-text-secondary) leading-relaxed">
                        <strong className="text-(--platform-text-primary) block mb-1.5">Як додати:</strong>
                        <ol className="pl-4 m-0 list-decimal space-y-1">
                            <li>Відкрийте Google Maps.</li>
                            <li>Знайдіть локацію та натисніть <strong>Поділитися</strong>.</li>
                            <li>Виберіть <strong>Вбудувати карту</strong>.</li>
                            <li>Скопіюйте HTML-код та вставте вище.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapSettings;