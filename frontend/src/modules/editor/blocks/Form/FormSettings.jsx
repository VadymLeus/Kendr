// frontend/src/modules/editor/blocks/Form/FormSettings.jsx
import React from 'react';
import { commonStyles, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import ButtonEditor from '../../ui/components/ButtonEditor';
import { CheckCircle, Mail, Trash2, MessageSquare,MousePointerClick } from 'lucide-react';

const FormSettings = ({ data, onChange, siteData }) => {
    const DEFAULT_BUTTON_DATA = {
        text: 'Надіслати',
        styleType: 'primary',
        variant: 'solid',
        size: 'medium',
        borderRadius: 6,
        width: 'auto',
        alignment: 'center',
        icon: 'none',
        iconPosition: 'right'
    };

    const buttonData = {
        ...DEFAULT_BUTTON_DATA,
        ...(data.button || {}),
        text: (data.button && data.button.text) || data.buttonText || DEFAULT_BUTTON_DATA.text
    };

    const updateData = (updates) => onChange({ ...data, ...updates });
    const handleButtonChange = (newButtonData) => {
        onChange({ 
            ...data, 
            button: newButtonData,
            buttonText: newButtonData.text 
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
                <SectionTitle icon={<MessageSquare size={18}/>}>Тексти та Кнопка</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <label style={commonStyles.label}>Повідомлення про успіх</label>
                    <div style={{ position: 'relative' }}>
                        <textarea 
                            className="custom-scrollbar"
                            value={data.successMessage || ''}
                            onChange={(e) => updateData({ successMessage: e.target.value })}
                            placeholder="Дякуємо! Ваше повідомлення надіслано."
                            style={{
                                ...commonStyles.textarea, 
                                minHeight: '80px',
                                paddingLeft: '36px'
                            }}
                        />
                        <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--platform-text-secondary)' }}>
                            <CheckCircle size={16} />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                     <div style={{
                         fontSize: '0.85rem', 
                         fontWeight: '600', 
                         marginBottom: '16px', 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: '8px',
                         color: 'var(--platform-text-primary)',
                         paddingBottom: '8px',
                         borderBottom: '1px solid var(--platform-border-color)'
                     }}>
                        <MousePointerClick size={16} style={{ color: 'var(--platform-accent)' }}/>
                        Кнопка відправки
                     </div>
                     
                     <ButtonEditor 
                        data={buttonData}
                        onChange={handleButtonChange}
                        siteData={siteData}
                        hideLinks={true}
                        showAlignment={true}
                    />
                </div>
            </div>

            <div>
                <SectionTitle icon={<Mail size={18}/>}>Налаштування сповіщень</SectionTitle>

                <div style={commonStyles.formGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{...commonStyles.label, marginBottom: 0}}>Email для сповіщень</label>
                        {data.notifyEmail && (
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => updateData({ notifyEmail: '' })}
                                icon={<Trash2 size={14}/>}
                                style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
                            >
                                Очистити
                            </Button>
                        )}
                    </div>
                    
                    <Input 
                        type="email"
                        value={data.notifyEmail || ''}
                        onChange={(e) => updateData({ notifyEmail: e.target.value })}
                        placeholder="admin@example.com"
                        leftIcon={<Mail size={16}/>}
                    />
                    <small style={{ color: 'var(--platform-text-secondary)', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                        Якщо залишити порожнім, листи надходитимуть на пошту власника акаунту.
                    </small>
                </div>
            </div>
        </div>
    );
};

export default FormSettings;