// frontend/src/modules/editor/blocks/Footer/FooterSettings.jsx
import React, { useState } from 'react';
import { commonStyles, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import { FileText, Link, Shield, File, Check, X } from 'lucide-react';

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
                <SectionTitle icon={<FileText size={18}/>}>Текст копірайту</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <Input 
                        name="copyright" 
                        value={data.copyright || `© ${new Date().getFullYear()} Ваш Сайт. Всі права захищені.`} 
                        onChange={(e) => handleChange('copyright', e.target.value)} 
                        required 
                        placeholder="© 2026 Company Name"
                        leftIcon={<FileText size={16}/>}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<Link size={18}/>}>Юридичні посилання</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Політика конфіденційності</label>
                    <Input 
                        type="text" 
                        name="privacyLink" 
                        value={data.privacyLink || '#'} 
                        onChange={(e) => handleChange('privacyLink', e.target.value)} 
                        placeholder="/privacy-policy"
                        leftIcon={<Shield size={16}/>}
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
                        leftIcon={<File size={16}/>}
                    />
                </div>
            </div>

            <div style={{ 
                display: 'flex', justifyContent: 'flex-end', gap: '10px', 
                paddingTop: '16px', borderTop: '1px solid var(--platform-border-color)' 
            }}>
                <Button variant="secondary" onClick={onClose} icon={<X size={16}/>}>
                    Скасувати
                </Button>
                <Button type="submit" variant="primary" icon={<Check size={16}/>}>
                    Зберегти
                </Button>
            </div>
        </form>
    );
};

export default FooterSettings;