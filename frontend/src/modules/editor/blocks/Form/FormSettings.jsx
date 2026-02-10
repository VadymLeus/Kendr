// frontend/src/modules/editor/blocks/Form/FormSettings.jsx
import React from 'react';
import { commonStyles, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import ButtonEditor from '../../ui/components/ButtonEditor';
import { CheckCircle, Mail, Trash2, MessageSquare, MousePointerClick } from 'lucide-react';

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
        <div className="flex flex-col gap-6">
            <div>
                <SectionTitle icon={<MessageSquare size={18}/>}>Тексти та Кнопка</SectionTitle>
                <div className="mb-5">
                    <label style={commonStyles.label}>Повідомлення про успіх</label>
                    <div className="relative">
                        <textarea 
                            className="custom-scrollbar custom-input min-h-20 pl-9 w-full resize-y"
                            value={data.successMessage || ''}
                            onChange={(e) => updateData({ successMessage: e.target.value })}
                            placeholder="Дякуємо! Ваше повідомлення надіслано."
                        />
                        <div className="absolute top-2.5 left-2.5 text-(--platform-text-secondary)">
                            <CheckCircle size={16} />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                      <div className="text-sm font-semibold mb-4 flex items-center gap-2 text-(--platform-text-primary) pb-2 border-b border-(--platform-border-color)">
                        <MousePointerClick size={16} className="text-(--platform-accent)"/>
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
                <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                        <label style={{...commonStyles.label, marginBottom: 0}}>Email для сповіщень</label>
                        {data.notifyEmail && (
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => updateData({ notifyEmail: '' })}
                                icon={<Trash2 size={14}/>}
                                className="py-1! px-2! text-xs! h-auto!"
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
                    <small className="text-(--platform-text-secondary) text-xs mt-1.5 block">
                        Якщо залишити порожнім, листи надходитимуть на пошту власника акаунту.
                    </small>
                </div>
            </div>
        </div>
    );
};

export default FormSettings;