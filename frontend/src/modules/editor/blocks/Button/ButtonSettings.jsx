// frontend/src/modules/editor/blocks/Button/ButtonSettings.jsx
import React from 'react';
import ButtonEditor from '../../ui/components/ButtonEditor';
import { commonStyles, SectionTitle, ToggleGroup } from '../../ui/configuration/SettingsUI';
import UniversalMediaInput from '../../../../shared/ui/complex/UniversalMediaInput'; 
import { Link, FileText } from 'lucide-react';

const ButtonSettings = ({ data, onChange, siteData }) => {
    const currentMode = data.isFile ? 'file' : 'url';
    const handleModeChange = (mode) => {
        if (mode === 'url') {
            onChange({ ...data, isFile: false, link: '' });
        } else {
            onChange({ ...data, isFile: true, link: '' });
        }
    };

    const handleFileChange = (path) => {
        onChange({
            ...data,
            link: path,
            isFile: true
        });
    };

    return (
        <div className="pb-5 flex flex-col gap-6">
            <div>
                <SectionTitle icon={<Link size={18}/>}>Дія кнопки</SectionTitle>
                <div className="mb-5">
                    <label style={commonStyles.label}>Тип посилання</label>
                    <ToggleGroup 
                        options={[
                            { value: 'url', label: 'URL / Сторінка', icon: <Link size={14}/> },
                            { value: 'file', label: 'Файл', icon: <FileText size={14}/> }
                        ]}
                        value={currentMode}
                        onChange={handleModeChange}
                    />
                </div>
                {currentMode === 'file' && (
                    <div className="mb-5">
                        <label style={commonStyles.label}>Файл для завантаження</label>
                        
                        <UniversalMediaInput
                            type="file"
                            value={data.link}
                            onChange={handleFileChange}
                            placeholder="Виберіть документ (PDF, DOCX...)"
                        />
                        <div className="mt-2 text-xs text-(--platform-text-secondary)">
                            Підтримуються: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV
                        </div>
                    </div>
                )}
            </div>
            <ButtonEditor 
                data={data} 
                onChange={onChange} 
                siteData={siteData} 
                hideLinks={currentMode === 'file'}
            />
        </div>
    );
};

export default ButtonSettings;