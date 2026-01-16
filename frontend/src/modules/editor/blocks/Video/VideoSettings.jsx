// frontend/src/modules/editor/blocks/Video/VideoSettings.jsx
import React from 'react';
import MediaInput from '../../../media/components/MediaInput';
import ImageInput from '../../../media/components/ImageInput';
import { commonStyles, SectionTitle, ToggleSwitch } from '../../ui/configuration/SettingsUI';
import OverlayControl from '../../ui/components/OverlayControl';
import { Video, Palette, Settings, Play, VolumeX, Repeat, Image as ImageIcon } from 'lucide-react';

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
    
    const handleVideoChange = (newUrl) => {
        const urlStr = typeof newUrl === 'string' ? newUrl : '';
        const relativeUrl = urlStr.replace(/^http:\/\/localhost:5000/, '');
        updateData({ url: relativeUrl });
    };

    const handlePosterChange = (e) => {
        let posterUrl = '';
        if (e && e.target && typeof e.target.value === 'string') {
            posterUrl = e.target.value;
        } else if (typeof e === 'string') {
            posterUrl = e;
        }
        
        const relativeUrl = posterUrl.replace(/^http:\/\/localhost:5000/, '');
        updateData({ poster: relativeUrl });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <SectionTitle icon={<Video size={18}/>}>Відео контент</SectionTitle>
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Відео файл</label>
                    <div style={{height: '150px', marginBottom: '16px'}}>
                        <MediaInput 
                            type="video"
                            value={safeData.url}
                            onChange={handleVideoChange}
                            placeholder="Завантажити відео"
                        />
                    </div>

                    <label style={{...commonStyles.label, display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <ImageIcon size={14} />
                        Обкладинка (Poster)
                    </label>
                    <div style={{height: '150px'}}>
                        <ImageInput 
                            value={safeData.poster}
                            onChange={handlePosterChange}
                            aspect={16/9}
                        />
                    </div>
                </div>
            </div>

            <div>
                <SectionTitle icon={<Settings size={18}/>}>Поведінка плеєра</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <ToggleSwitch 
                        checked={safeData.autoplay}
                        onChange={(val) => updateData({ autoplay: val, muted: val ? true : safeData.muted })}
                        label="Автоплей (Autoplay)"
                        icon={<Play size={16}/>}
                    />

                    <ToggleSwitch 
                        checked={safeData.muted}
                        onChange={(val) => updateData({ muted: val })}
                        label="Без звуку (Muted)"
                        icon={<VolumeX size={16}/>}
                    />

                    <ToggleSwitch 
                        checked={safeData.loop}
                        onChange={(val) => updateData({ loop: val })}
                        label="Зациклити (Loop)"
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