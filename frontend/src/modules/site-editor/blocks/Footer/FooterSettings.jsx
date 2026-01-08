// frontend/src/modules/site-editor/blocks/Footer/FooterSettings.jsx
import React, { useState } from 'react';
import { commonStyles, SectionTitle } from '../../components/common/SettingsUI';
import { Input } from '../../../../common/components/ui/Input';
import { Button } from '../../../../common/components/ui/Button';
import { 
    IconFileText, IconLink, IconShield, IconFile, IconCheck, IconX 
} from '../../../../common/components/ui/Icons';

const FooterSettings = ({ initialData, onSave, onClose }) => {
    const [data, setData] = useState(initialData || {});

    const handleChange = (name, value) => {
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(data);
    };

    return (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <SectionTitle icon={<IconFileText size={18}/>}>Текст копірайту</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <Input 
                        name="copyright" 
                        value={data.copyright || `© ${new Date().getFullYear()} Ваш Сайт. Всі права захищені.`} 
                        onChange={(e) => handleChange('copyright', e.target.value)} 
                        required 
                        placeholder="© 2026 Company Name"
                        leftIcon={<IconFileText size={16}/>}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<IconLink size={18}/>}>Юридичні посилання</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Політика конфіденційності</label>
                    <Input 
                        type="text" 
                        name="privacyLink" 
                        value={data.privacyLink || '#'} 
                        onChange={(e) => handleChange('privacyLink', e.target.value)} 
                        placeholder="/privacy-policy"
                        leftIcon={<IconShield size={16}/>}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Умови використання</label>
                    <Input 
                        type="text" 
                        name="termsLink" 
                        value={data.termsLink || '#'} 
                        onChange={(e) => handleChange('termsLink', e.target.value)} 
                        placeholder="/terms-of-use"
                        leftIcon={<IconFile size={16}/>}
                    />
                </div>
            </div>

            <div style={{ 
                display: 'flex', justifyContent: 'flex-end', gap: '10px', 
                paddingTop: '16px', borderTop: '1px solid var(--platform-border-color)' 
            }}>
                <Button variant="secondary" onClick={onClose} icon={<IconX size={16}/>}>
                    Скасувати
                </Button>
                <Button type="submit" variant="primary" icon={<IconCheck size={16}/>}>
                    Зберегти
                </Button>
            </div>
        </form>
    );
};

export default FooterSettings;