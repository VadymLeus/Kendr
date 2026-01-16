// frontend/src/modules/editor/ui/components/FontSelector.jsx
import React, { useEffect, useState } from 'react';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import apiClient from '../../../../shared/api/api';
import { FONT_LIBRARY } from '../../core/editorConfig';
import { Palette, Download, Globe, Type, Pilcrow, AlertCircle } from 'lucide-react';

const FontSelector = ({ value, onChange, label = "Шрифт", siteFonts }) => {
    const [uploadedFonts, setUploadedFonts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchCustomFonts = async () => {
            try {
                const res = await apiClient.get('/media');
                if (Array.isArray(res.data)) {
                    const fonts = res.data
                        .filter(f => 
                            f.file_type === 'font' || 
                            f.mime_type?.includes('font') || 
                            /\.(ttf|otf|woff|woff2)$/i.test(f.original_file_name)
                        )
                        .map(f => ({ 
                            value: f.path_full, 
                            label: f.display_name || f.alt_text || f.original_file_name,
                            icon: Download
                        }));
                    setUploadedFonts(fonts);
                }
            } catch (error) { 
                console.error("Помилка завантаження шрифтів:", error); 
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomFonts();
    }, []);

    const groupedOptions = [
        {
            label: "Глобальні стилі",
            options: [
                { value: 'global', label: 'За замовчуванням', icon: Palette },
                { value: 'site_heading', label: 'Шрифт заголовків', icon: Type },
                { value: 'site_body', label: 'Шрифт тексту', icon: Pilcrow },
            ]
        },
        {
            label: "Мої шрифти",
            options: uploadedFonts.length > 0 
                ? uploadedFonts 
                : [{ value: 'disabled_custom', label: 'Немає завантажених', disabled: true, icon: AlertCircle }]
        },
        {
            label: "Google Fonts",
            options: FONT_LIBRARY
                .filter(f => f.value !== 'global')
                .map(f => ({ ...f, icon: Globe }))
        }
    ];

    return (
        <div style={{ marginBottom: '16px' }}>
            {label && (
                <label style={{ 
                    display: 'block', fontSize: '0.85rem', fontWeight: '500', 
                    color: 'var(--platform-text-secondary)', marginBottom: '8px' 
                }}>
                    {label}
                </label>
            )}
            <CustomSelect
                value={value || 'global'}
                onChange={(e) => onChange(e.target.value)}
                options={groupedOptions}
                isLoading={isLoading}
                placeholder="Оберіть шрифт..."
            />
        </div>
    );
};

export default FontSelector;