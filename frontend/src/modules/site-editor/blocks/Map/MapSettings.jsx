// frontend/src/modules/site-editor/blocks/Map/MapSettings.jsx
import React from 'react';
import { commonStyles } from '../../components/common/SettingsUI';
import CustomSelect from '../../../../common/components/ui/CustomSelect';

const helpTextStyle = {
    color: 'var(--platform-text-secondary)',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    fontStyle: 'italic',
    lineHeight: '1.4'
};

const MapSettings = ({ data, onChange }) => {
    const handleChange = (e) => {
        onChange({ ...data, [e.target.name]: e.target.value });
    };

    const sizeOptions = [
        { value: 'small', label: 'Маленька' },
        { value: 'medium', label: 'Середня' },
        { value: 'large', label: 'Велика' }
    ];

    return (
        <div>
            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Вбудований код карти (iframe)</label>
                <textarea
                    name="embed_code"
                    value={data.embed_code || ''}
                    onChange={handleChange}
                    style={{
                        ...commonStyles.input,
                        minHeight: '150px',
                        resize: 'vertical',
                        fontFamily: 'monospace',
                        lineHeight: '1.6'
                    }}
                    placeholder="Вставте сюди код <iframe ...> з Google Maps..."
                    rows="6"
                />
                <p style={helpTextStyle}>
                    Зайдіть на Google Maps, знайдіть місце, натисніть 'Поділитися' → 'Вбудувати карту' і скопіюйте код сюди.
                </p>
            </div>

            <div style={commonStyles.formGroup}>
                <label style={commonStyles.label}>Розмір карти:</label>
                <CustomSelect
                    name="sizePreset"
                    value={data.sizePreset || 'medium'}
                    onChange={handleChange}
                    options={sizeOptions}
                    style={commonStyles.input}
                />
            </div>
        </div>
    );
};

export default MapSettings;