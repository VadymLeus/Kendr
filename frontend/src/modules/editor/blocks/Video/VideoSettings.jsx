// frontend/src/modules/editor/blocks/Video/VideoSettings.jsx
import React from 'react';
import { SectionTitle, ToggleSwitch } from '../../ui/configuration/SettingsUI';
import OverlayControl from '../../ui/components/OverlayControl';
import UniversalMediaInput from '../../../../shared/ui/complex/UniversalMediaInput';
import { Input } from '../../../../shared/ui/elements';
import { BASE_URL } from '../../../../shared/config';
import { Video, Palette, Settings, Play, VolumeX, Repeat, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

const VideoSettings = ({ data, onChange }) => {
    const safeData = {
        url: data.url || '',
        poster: data.poster || '',
        overlay_color: data.overlay_color || '#000000', 
        overlay_opacity: (data.overlay_opacity !== undefined && !isNaN(data.overlay_opacity)) ? parseFloat(data.overlay_opacity) : 0.5,
        autoplay: data.autoplay !== undefined ? data.autoplay : true,
        muted: data.muted !== undefined ? data.muted : true,
        loop: data.loop !== undefined ? data.loop : true,
        controls: data.controls !== undefined ? data.controls : false,
        ...data
    };

    const updateData = (updates) => onChange({ ...safeData, ...updates }, true);
    const handleVideoChange = (val) => {
        let finalUrl = '';
        if (val && val.target && typeof val.target.value === 'string') finalUrl = val.target.value;
        else if (typeof val === 'string') finalUrl = val;
        const isYouTube = finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be');
        const relativeUrl = isYouTube ? finalUrl : finalUrl.replace(BASE_URL, '');
        updateData({ url: relativeUrl });
    };

    const handlePosterChange = (val) => {
        let posterUrl = '';
        if (val && val.target && typeof val.target.value === 'string') posterUrl = val.target.value;
        else if (typeof val === 'string') posterUrl = val;
        const relativeUrl = posterUrl.replace(BASE_URL, '');
        updateData({ poster: relativeUrl });
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <SectionTitle icon={<Video size={18}/>}>Відео контент</SectionTitle>
                <div className="mb-5">
                    <label className="block text-sm font-medium text-(--platform-text-primary) mb-1.5">
                        Відео файл
                    </label>
                    <div className="h-37.5 mb-3">
                        <UniversalMediaInput 
                            type="video"
                            value={safeData.url && !safeData.url.includes('youtu') ? safeData.url : ''}
                            onChange={handleVideoChange}
                            placeholder="Завантажити відео"
                        />
                    </div>
                    <label className="block text-sm font-medium text-(--platform-text-primary) mb-1.5 mt-4">
                        Або посилання на YouTube
                    </label>
                    <Input 
                        value={safeData.url}
                        onChange={handleVideoChange}
                        placeholder="https://www.youtube.com/watch?v=..."
                        leftIcon={<LinkIcon size={16}/>}
                    />
                </div>
                <div className="mb-5">
                    <label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-(--platform-text-primary)">
                        <ImageIcon size={14} className="text-(--platform-text-secondary)" />
                        Обкладинка
                    </label>
                    <div className="h-37.5">
                        <UniversalMediaInput 
                            type="image"
                            value={safeData.poster}
                            onChange={handlePosterChange}
                            aspect={16/9}
                        />
                    </div>
                </div>
            </div>
            <div>
                <SectionTitle icon={<Settings size={18}/>}>Поведінка плеєра</SectionTitle>
                <div className="flex flex-col gap-3">
                    <ToggleSwitch 
                        checked={safeData.autoplay}
                        onChange={(val) => updateData({ autoplay: val, muted: val ? true : safeData.muted })}
                        label="Автоплей"
                        icon={<Play size={16}/>}
                    />
                    <ToggleSwitch 
                        checked={safeData.muted}
                        onChange={(val) => updateData({ muted: val })}
                        label="Без звуку"
                        icon={<VolumeX size={16}/>}
                    />
                    <ToggleSwitch 
                        checked={safeData.loop}
                        onChange={(val) => updateData({ loop: val })}
                        label="Зациклити"
                        icon={<Repeat size={16}/>}
                    />
                    <ToggleSwitch 
                        checked={safeData.controls}
                        onChange={(val) => updateData({ controls: val })}
                        label="Показувати елементи керування"
                        icon={<Settings size={16}/>}
                    />
                </div>
            </div>
            <div>
                <SectionTitle icon={<Palette size={18}/>}>Вигляд та Фон</SectionTitle>
                <OverlayControl 
                    color={safeData.overlay_color}
                    opacity={safeData.overlay_opacity}
                    onColorChange={(val) => onChange({ ...safeData, overlay_color: val }, true)}
                    onOpacityChange={(val) => onChange({ ...safeData, overlay_opacity: val }, false)}
                />
            </div>
        </div>
    );
};

export default VideoSettings;