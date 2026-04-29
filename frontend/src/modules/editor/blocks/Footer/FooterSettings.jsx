// frontend/src/modules/editor/blocks/Footer/FooterSettings.jsx
import React from 'react';
import { generateBlockId } from '../../core/editorConfig';
import { commonStyles, SectionTitle, ToggleGroup } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import OverlayControl from '../../ui/components/OverlayControl';
import UniversalMediaInput from '../../../../shared/ui/complex/UniversalMediaInput';
import FontSelector from '../../ui/components/FontSelector';
import { BASE_URL } from '../../../../shared/config';
import { Palette, Image as ImageIcon, Type, FileText, Link as LinkIcon, Share2, Trash2, Plus, Moon, Sun, Monitor } from 'lucide-react';

const SOCIAL_PLATFORMS = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'github', label: 'GitHub' },
];

const FooterSettings = ({ data, onChange, siteData }) => {
    const updateData = (updates) => onChange({ ...data, ...updates });
    const themeSettings = siteData?.theme_settings || {};
    const currentSiteFonts = {
        heading: themeSettings.font_heading,
        body: themeSettings.font_body
    };
    const currentVariant = data.variant || 'standard';
    const currentThemeMode = data.theme_mode || 'auto';
    const currentBgType = data.bg_type || 'color';
    const handleImageChange = (val) => {
        let finalUrl = val?.target?.value || val || '';
        updateData({ bg_image: finalUrl.replace(BASE_URL, '') });
    };

    const handleAddLink = () => {
        const newLinks = [...(data.links || []), { id: generateBlockId(), label: 'Нове посилання', link: '#' }];
        updateData({ links: newLinks });
    };

    const handleUpdateLink = (index, field, value) => {
        const newLinks = [...(data.links || [])];
        newLinks[index][field] = value;
        updateData({ links: newLinks });
    };

    const handleRemoveLink = (index) => {
        const newLinks = (data.links || []).filter((_, i) => i !== index);
        updateData({ links: newLinks });
    };

    const handleAddSocial = () => {
        const newSocials = [...(data.socials || []), { id: generateBlockId(), platform: 'instagram', link: 'https://' }];
        updateData({ socials: newSocials });
    };

    const handleUpdateSocial = (index, field, value) => {
        const newSocials = [...(data.socials || [])];
        newSocials[index][field] = value;
        updateData({ socials: newSocials });
    };

    const handleRemoveSocial = (index) => {
        const newSocials = (data.socials || []).filter((_, i) => i !== index);
        updateData({ socials: newSocials });
    };

    const bgTypeOptions = [
        { value: 'color', label: 'Колір', icon: <Palette size={16}/> },
        { value: 'image', label: 'Фото', icon: <ImageIcon size={16}/> }
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <SectionTitle icon={<Palette size={18}/>}>Фон та Тема</SectionTitle>
                <div className="mb-5">
                    <label style={commonStyles.label}>Варіант відображення</label>
                    <ToggleGroup 
                        options={[
                            { value: 'standard', label: 'Стандартний' },
                            { value: 'simple', label: 'Мінімалізм' },
                        ]}
                        value={currentVariant}
                        onChange={(val) => updateData({ variant: val })}
                    />
                </div>
                <div className="mb-5">
                    <label style={commonStyles.label}>Тема</label>
                    <ToggleGroup 
                        options={[
                            { value: 'auto', label: <div className="flex gap-1.5 items-center"><Monitor size={16}/> Авто</div> },
                            { value: 'light', label: <div className="flex gap-1.5 items-center"><Sun size={16}/> Світла</div> },
                            { value: 'dark', label: <div className="flex gap-1.5 items-center"><Moon size={16}/> Темна</div> },
                        ]}
                        value={currentThemeMode}
                        onChange={(val) => updateData({ theme_mode: val })}
                    />
                </div>
                <div className="mb-5">
                    <label style={commonStyles.label}>Тип фону</label>
                    <ToggleGroup 
                        options={bgTypeOptions}
                        value={currentBgType}
                        onChange={(val) => updateData({ bg_type: val })}
                    />
                </div>
                {currentBgType === 'color' && (
                    <OverlayControl 
                        color={data.bg_color || '#111827'}
                        opacity={data.bg_opacity !== undefined ? data.bg_opacity : 1} 
                        onColorChange={(val) => updateData({ bg_color: val })}
                        onOpacityChange={(val) => updateData({ bg_opacity: val })} 
                    />
                )}
                {currentBgType === 'image' && (
                    <div className="mb-5">
                        <label style={commonStyles.label}>Фонове зображення</label>
                        <div className="h-40">
                            <UniversalMediaInput 
                                type="image"
                                value={data.bg_image}
                                onChange={handleImageChange}
                                aspect={21/9}
                            />
                        </div>
                    </div>
                )}
                {currentBgType === 'image' && (
                    <OverlayControl 
                        color={data.overlay_color || '#000000'}
                        opacity={data.overlay_opacity !== undefined ? data.overlay_opacity : 0.5}
                        onColorChange={(val) => updateData({ overlay_color: val })}
                        onOpacityChange={(val) => updateData({ overlay_opacity: val })}
                    />
                )}
            </div>
            <div>
                <SectionTitle icon={<Type size={18}/>}>Бренд та Типографіка</SectionTitle>
                <div className="mb-5">
                    <FontSelector 
                        value={data.titleFontFamily}
                        onChange={(val) => updateData({ titleFontFamily: val })}
                        label="Шрифт логотипу"
                        siteFonts={currentSiteFonts}
                    />
                </div>
                <div className="mb-5">
                    <FontSelector 
                        value={data.contentFontFamily}
                        onChange={(val) => updateData({ contentFontFamily: val })}
                        label="Шрифт посилань та тексту"
                        siteFonts={currentSiteFonts}
                    />
                </div>
                {currentVariant !== 'simple' && (
                    <div className="mb-5">
                        <Input 
                            label="Текст логотипу" 
                            value={data.logo_text || 'Логотип'} 
                            onChange={(e) => updateData({ logo_text: e.target.value })} 
                        />
                    </div>
                )}
                <div className="mb-5">
                    <Input 
                        label="Текст копірайту"
                        name="copyright" 
                        value={data.copyright || `© ${new Date().getFullYear()} Назва компанії`} 
                        onChange={(e) => updateData({ copyright: e.target.value })} 
                        placeholder="© 2026 Company Name"
                        leftIcon={<FileText size={16}/>}
                    />
                </div>
            </div>
            {currentVariant !== 'simple' && (
                <>
                    <div className="border-t border-(--platform-border-color) pt-6">
                        <SectionTitle icon={<LinkIcon size={18}/>}>Навігація / Посилання</SectionTitle>
                        <div className="flex flex-col gap-3">
                            {(data.links || []).map((link, idx) => (
                                <div key={link.id || idx} className="flex gap-2 items-start bg-(--platform-card-bg) p-3 rounded-lg border border-(--platform-border-color)">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <Input 
                                            value={link.label} 
                                            onChange={(e) => handleUpdateLink(idx, 'label', e.target.value)} 
                                            placeholder="Назва"
                                        />
                                        <Input 
                                            value={link.link} 
                                            onChange={(e) => handleUpdateLink(idx, 'link', e.target.value)} 
                                            placeholder="URL"
                                        />
                                    </div>
                                    <Button variant="danger" size="sm" onClick={() => handleRemoveLink(idx)} className="w-9! h-9! p-0! shrink-0">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" onClick={handleAddLink} icon={<Plus size={16} />} className="w-full border-dashed">
                                Додати посилання
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-(--platform-border-color) pt-6">
                        <SectionTitle icon={<Share2 size={18}/>}>Соціальні мережі</SectionTitle>
                        <div className="flex flex-col gap-3">
                            {(data.socials || []).map((social, idx) => (
                                <div key={social.id || idx} className="flex gap-2 items-start bg-(--platform-card-bg) p-3 rounded-lg border border-(--platform-border-color)">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <CustomSelect 
                                            value={social.platform}
                                            onChange={(e) => handleUpdateSocial(idx, 'platform', e.target.value)}
                                            options={SOCIAL_PLATFORMS}
                                        />
                                        <Input 
                                            value={social.link} 
                                            onChange={(e) => handleUpdateSocial(idx, 'link', e.target.value)} 
                                            placeholder="https://"
                                        />
                                    </div>
                                    <Button variant="danger" size="sm" onClick={() => handleRemoveSocial(idx)} className="w-9! h-9! p-0! shrink-0">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" onClick={handleAddSocial} icon={<Plus size={16} />} className="w-full border-dashed">
                                Додати соцмережу
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FooterSettings;