// frontend/src/modules/editor/blocks/Form/FormSettings.jsx
import React from 'react';
import { commonStyles, SectionTitle } from '../../ui/configuration/SettingsUI';
import { Input } from '../../../../shared/ui/elements/Input';
import { Button } from '../../../../shared/ui/elements/Button';
import { 
    MousePointerClick, 
    CheckCircle, 
    Mail, 
    Trash2, 
    MessageSquare 
} from 'lucide-react';

const FormSettings = ({ data, onChange }) => {
    
    const updateData = (updates) => onChange({ ...data, ...updates });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
                <SectionTitle icon={<MessageSquare size={18}/>}>Тексти форми</SectionTitle>
                
                <div style={commonStyles.formGroup}>
                    <Input 
                        label="Текст кнопки"
                        value={data.buttonText || ''}
                        onChange={(e) => updateData({ buttonText: e.target.value })}
                        placeholder="Наприклад: Надіслати"
                        leftIcon={<MousePointerClick size={16}/>}
                    />
                </div>
                
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