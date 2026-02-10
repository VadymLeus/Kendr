// frontend/src/modules/editor/blocks/SocialIcons/SocialIconsSettings.jsx
import React from 'react';
import { commonStyles, ToggleGroup, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { AlignLeft, AlignCenter, AlignRight, Sun, Moon, LayoutTemplate, Share2, Facebook, Instagram, Send, Youtube, Music } from 'lucide-react';

const socialNetworks = [
    { key: 'facebook', name: 'Facebook', icon: <Facebook size={16}/>, placeholder: 'https://facebook.com/page' },
    { key: 'instagram', name: 'Instagram', icon: <Instagram size={16}/>, placeholder: 'https://instagram.com/user' },
    { key: 'telegram', name: 'Telegram', icon: <Send size={16}/>, placeholder: 'https://t.me/channel' },
    { key: 'youtube', name: 'YouTube', icon: <Youtube size={16}/>, placeholder: 'https://youtube.com/@channel' },
    { key: 'tiktok', name: 'TikTok', icon: <Music size={16}/>, placeholder: 'https://tiktok.com/@user' }
];

const SocialIconsSettings = ({ data, onChange }) => {
    const updateData = (updates) => onChange({ ...data, ...updates });
    return (
        <div className="flex flex-col gap-6">
            <div>
                <SectionTitle icon={<LayoutTemplate size={18}/>}>Вигляд</SectionTitle>
                <div className="mb-5">
                    <label style={commonStyles.label}>Вирівнювання</label>
                    <ToggleGroup 
                        options={[
                            { value: 'left', label: <AlignLeft size={18} /> },
                            { value: 'center', label: <AlignCenter size={18} /> },
                            { value: 'right', label: <AlignRight size={18} /> }
                        ]}
                        value={data.alignment || 'left'}
                        onChange={(val) => updateData({ alignment: val })}
                    />
                </div>

                <div className="mb-5">
                    <label style={commonStyles.label}>Колір іконок (Тема)</label>
                    <ToggleGroup 
                        options={[
                            { value: 'auto', label: 'Авто' },
                            { value: 'light', label: <div className="flex gap-1.5"><Sun size={16}/> Темні</div> },
                            { value: 'dark', label: <div className="flex gap-1.5"><Moon size={16}/> Світлі</div> },
                        ]}
                        value={data.theme_mode || 'auto'}
                        onChange={(val) => updateData({ theme_mode: val })}
                    />
                </div>
            </div>
            <div>
                <SectionTitle icon={<Share2 size={18}/>}>Посилання</SectionTitle>

                <div className="flex flex-col gap-3">
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