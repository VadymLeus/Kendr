// frontend/src/modules/editor/ui/tabs/AdvancedSettingsTab.jsx
import React from 'react';
import { Input } from '../../../../shared/ui/elements/Input';
import CustomSelect from '../../../../shared/ui/elements/CustomSelect';
import { Hash, MoveVertical, Link2, Maximize } from 'lucide-react';
import { SectionTitle } from '../configuration/SettingsUI';
import AnimationSettings from '../configuration/AnimationSettings';
import SpacingControl from '../configuration/SpacingControl';

const AdvancedSettingsTab = ({ data, onUpdate }) => {
    const handleAnchorChange = (e) => {
        const rawValue = e.target.value;
        const sanitized = rawValue.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
        
        onUpdate({
            ...data,
            anchorId: sanitized
        });
    };

    const handleStyleUpdate = (newStyles) => {
        const newData = { 
            ...data, 
            styles: { 
                ...data.styles, 
                ...newStyles 
            } 
        };
        onUpdate(newData);
    };

    const handleAnimationUpdate = (newAnimationConfig) => {
        onUpdate({
            ...data,
            animation: newAnimationConfig
        });
    };

    const handleHeightChange = (e) => {
        onUpdate({
            ...data,
            height: e.target.value
        });
    };

    const heightOptions = [
        { value: 'small', label: 'Маленька (300px)' },
        { value: 'medium', label: 'Середня (500px)' },
        { value: 'large', label: 'Велика (700px)' },
        { value: 'full', label: 'На весь екран' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <SectionTitle icon={<Hash size={16} />}>Якір блоку (ID)</SectionTitle>
                <div style={{ marginTop: '12px' }}>
                    <Input 
                        value={data.anchorId || ''}
                        onChange={handleAnchorChange}
                        placeholder="наприклад: about-us"
                        leftIcon={<Link2 size={14} />}
                        wrapperStyle={{ marginBottom: '8px' }}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--platform-text-secondary)', lineHeight: '1.4' }}>
                        Використовуйте цей ID для посилань у меню (наприклад, #about-us).
                    </div>
                </div>
            </div>

            <div style={{ height: '1px', background: 'var(--platform-border-color)', opacity: 0.5 }}></div>

            <div>
                <SectionTitle icon={<Maximize size={16}/>}>Висота блоку</SectionTitle>
                <div style={{ marginTop: '12px' }}>
                    <CustomSelect 
                        name="height" 
                        value={data.height || 'medium'} 
                        onChange={handleHeightChange} 
                        options={heightOptions}
                        leftIcon={<Maximize size={16}/>}
                    />
                </div>
            </div>

            <div style={{ height: '1px', background: 'var(--platform-border-color)', opacity: 0.5 }}></div>

            <div>
                <SectionTitle icon={<MoveVertical size={16} />}>Внутрішні відступи</SectionTitle>
                <div style={{ marginTop: '12px' }}>
                    <SpacingControl 
                        styles={data.styles || {}} 
                        onChange={handleStyleUpdate} 
                    />
                </div>
            </div>

            <div style={{ height: '1px', background: 'var(--platform-border-color)', opacity: 0.5 }}></div>

            <AnimationSettings 
                animationConfig={data.animation} 
                onChange={handleAnimationUpdate} 
            />
        </div>
    );
};

export default AdvancedSettingsTab;