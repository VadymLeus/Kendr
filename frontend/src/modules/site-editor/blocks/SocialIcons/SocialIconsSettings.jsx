// frontend/src/modules/site-editor/blocks/SocialIcons/SocialIconsSettings.jsx
import React from 'react';
import { commonStyles, ToggleGroup, SectionTitle } from '../../components/common/SettingsUI';
import { Input } from '../../../../common/components/ui/Input';
import { 
    IconAlignLeft, IconAlignCenter, IconAlignRight, 
    IconSun, IconMoon, IconLayout, IconShare,
    IconFacebook, IconInstagram, IconTelegram, IconYoutube, IconTiktok
} from '../../../../common/components/ui/Icons';

const socialNetworks = [
    { key: 'facebook', name: 'Facebook', icon: <IconFacebook size={16}/>, placeholder: 'https://facebook.com/page' },
    { key: 'instagram', name: 'Instagram', icon: <IconInstagram size={16}/>, placeholder: 'https://instagram.com/user' },
    { key: 'telegram', name: 'Telegram', icon: <IconTelegram size={16}/>, placeholder: 'https://t.me/channel' },
    { key: 'youtube', name: 'YouTube', icon: <IconYoutube size={16}/>, placeholder: 'https://youtube.com/@channel' },
    { key: 'tiktok', name: 'TikTok', icon: <IconTiktok size={16}/>, placeholder: 'https://tiktok.com/@user' }
];

const SocialIconsSettings = ({ data, onChange }) => {
    
    const updateData = (updates) => onChange({ ...data, ...updates });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <SectionTitle icon={<IconLayout size={18}/>}>Вигляд</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Вирівнювання</label>
                    <ToggleGroup 
                        options={[
                            { value: 'left', label: <IconAlignLeft size={18} /> },
                            { value: 'center', label: <IconAlignCenter size={18} /> },
                            { value: 'right', label: <IconAlignRight size={18} /> }
                        ]}
                        value={data.alignment || 'left'}
                        onChange={(val) => updateData({ alignment: val })}
                    />
                </div>

                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Колір іконок (Тема)</label>
                    <ToggleGroup 
                        options={[
                            { value: 'auto', label: 'Авто' },
                            { value: 'light', label: <div style={{display:'flex', gap:'6px'}}><IconSun size={16}/> Темні</div> },
                            { value: 'dark', label: <div style={{display:'flex', gap:'6px'}}><IconMoon size={16}/> Світлі</div> },
                        ]}
                        value={data.theme_mode || 'auto'}
                        onChange={(val) => updateData({ theme_mode: val })}
                    />
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                        Оберіть "Темні" для світлого фону блоку, "Світлі" для темного.
                    </small>
                </div>
            </div>
            <div>
                <SectionTitle icon={<IconShare size={18}/>}>Посилання</SectionTitle>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {socialNetworks.map(net => (
                        <Input
                            key={net.key}
                            label={net.name}
                            value={data[net.key] || ''}
                            onChange={(e) => updateData({ [net.key]: e.target.value })}
                            placeholder={net.placeholder}
                            leftIcon={net.icon}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SocialIconsSettings;