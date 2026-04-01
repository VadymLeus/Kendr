// frontend/src/modules/dashboard/features/settings/components/GeneralIdentitySection.jsx 
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../../../app/providers/AuthContext';
import { Button, Input, Switch } from '../../../../../shared/ui/elements';
import CustomSelect from '../../../../../shared/ui/elements/CustomSelect';
import { InputWithCounter } from '../../../../../shared/ui/complex/InputWithCounter';
import UniversalMediaInput from '../../../../../shared/ui/complex/UniversalMediaInput';
import { TEXT_LIMITS } from '../../../../../shared/config/limits';
import { toast } from 'react-toastify';
import { useCooldown } from '../../../../../shared/hooks/useCooldown';
import { Image, Upload, Trash, Type, AlertCircle, CreditCard, Key, Lock, Globe, Check, Timer, Loader, Cookie } from 'lucide-react';

const GeneralIdentitySection = ({ 
    data, 
    handleChange, 
    identityData, 
    handleIdentityChange, 
    handleSaveIdentity, 
    isSavingIdentity, 
    titleError,
    slugError, 
    slugStatus,
    hasIdentityChanges, 
    onUpdate, 
    getImageUrl, 
    isAdmin,
    isLocked 
}) => {
    const { user } = useContext(AuthContext);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
    const [statusCooldown, startStatusCooldown] = useCooldown('kendr_status_cooldown');
    const isStaff = user?.role === 'admin' || user?.role === 'moderator' || isAdmin;
    const handleStatusSave = () => {
        if (statusCooldown > 0) {
            toast.warning(`Зачекайте ${statusCooldown}с перед наступною зміною статусу.`);
            return;
        }
        toast.success('Статус сайту успішно оновлено!');
        startStatusCooldown(30);
    };
    
    const statusOptions = [
        { value: 'published', label: 'Опубліковано (Доступний всім)', icon: Globe, iconProps: { className: 'text-green-500' } },
        { value: 'maintenance', label: 'Тех. роботи (Тимчасово закритий)', icon: AlertCircle, iconProps: { className: 'text-orange-500' } }, 
        { value: 'private', label: 'Приватний (Прихований)', icon: Lock, iconProps: { className: 'text-gray-500' } }
    ];
    
    const canSaveIdentity = hasIdentityChanges && !titleError && !slugError && !isSavingIdentity && (slugStatus === 'available' || slugStatus === 'unchanged');
    return (
        <>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Image size={22} className="text-(--platform-accent)" /> Логотип та Назва
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                            Налаштуйте брендинг та адресу сайту
                        </p>
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm">
                        Логотип сайту
                    </label>
                    <div className="flex justify-center">
                        <div className="w-48">
                            <UniversalMediaInput
                                type="image"
                                value={data.logo_url}
                                onChange={(val) => {
                                    const newVal = val && val.target ? val.target.value : val;
                                    handleChange('logo_url', newVal);
                                    if(onUpdate) onUpdate({ logo_url: newVal });
                                }}
                                aspect={1}
                                triggerStyle={{ display: 'block', padding: 0, border: 'none', background: 'transparent', width: '100%', cursor: 'pointer' }}
                            >
                                <div 
                                    className="w-full h-32 border border-(--platform-border-color) rounded-xl overflow-hidden relative flex items-center justify-center group bg-(--platform-bg) bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-repeat"
                                    onMouseEnter={() => setIsLogoHovered(true)} 
                                    onMouseLeave={() => setIsLogoHovered(false)}
                                >
                                    {data.logo_url ? (
                                        <img 
                                            src={getImageUrl(data.logo_url)} 
                                            alt="Logo" 
                                            className="max-w-[90%] max-h-[90%] object-contain block z-10"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <Image size={32} className="text-(--platform-text-secondary) opacity-50 z-10" />
                                    )}
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[2px] z-20 ${isLogoHovered ? 'opacity-100' : 'opacity-0'}`}>
                                        <Upload size={24} />
                                    </div>
                                    {data.logo_url && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleChange('logo_url', ''); if(onUpdate) onUpdate({ logo_url: '' }); }}
                                            className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center cursor-pointer z-30 transition-colors hover:bg-(--platform-danger) border-none"
                                            title="Видалити лого"
                                        >
                                            <Trash size={14} />
                                        </button>
                                    )}
                                </div>
                            </UniversalMediaInput>
                        </div>
                    </div>
                </div>
                <div className="mb-4">
                    <InputWithCounter
                        label="Назва сайту"
                        value={identityData.title}
                        onChange={(e) => handleIdentityChange('title', e.target.value)}
                        placeholder="Мій інтернет-магазин"
                        leftIcon={<Type size={16}/>}
                        limitKey="SITE_NAME"
                    />
                    {titleError && (
                        <div className="text-[#e53e3e] text-xs flex items-center gap-1 mt-1">
                            <AlertCircle size={14} /> {titleError}
                        </div>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm">Веб-адреса</label>
                    <div className="flex gap-2 items-start">
                        <div className="py-3 px-4 bg-(--platform-bg) rounded-lg border border-(--platform-border-color) text-(--platform-text-secondary) text-sm whitespace-nowrap h-11.5">
                            /site/
                        </div>
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                className={`w-full py-3 px-4 pr-10 rounded-lg border ${slugError ? 'border-red-500' : 'border-(--platform-border-color)'} bg-(--platform-bg) text-(--platform-text-primary) text-sm box-border transition-all duration-200 font-medium focus:outline-none focus:border-(--platform-accent) focus:ring-2 focus:ring-(--platform-accent)/10 h-11.5`}
                                value={identityData.slug} 
                                onChange={(e) => handleIdentityChange('slug', e.target.value)} 
                                maxLength={TEXT_LIMITS.SITE_SLUG}
                            />
                            <div className="absolute right-3 top-3.5">
                                {slugStatus === 'checking' ? <Loader size={18} className="animate-spin text-gray-400" /> : 
                                 slugStatus === 'available' ? <Check size={18} className="text-emerald-500" /> : 
                                 (slugStatus === 'taken' || slugStatus === 'invalid') ? <AlertCircle size={18} className="text-red-500" /> : 
                                 <Globe size={16} className="text-gray-400" />}
                            </div>
                            <div className="flex justify-between items-start mt-1.5">
                                <div className="text-(--platform-text-secondary) text-xs">
                                    Максимум {TEXT_LIMITS.SITE_SLUG} символів
                                </div>
                                {slugError && <div className="text-[#e53e3e] text-xs flex items-center gap-1"><AlertCircle size={14} /> {slugError}</div>}
                            </div>
                        </div>
                        <Button 
                            onClick={handleSaveIdentity} 
                            disabled={!canSaveIdentity}
                            style={{ height: '46px' }}
                        >
                            {isSavingIdentity ? '...' : 'Зберегти'}
                        </Button>
                    </div>
                </div>
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Cookie size={22} className="text-(--platform-accent)" /> Cookie Банер
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0">
                            Запитувати згоду відвідувачів на використання файлів cookie
                        </p>
                    </div>
                    <Switch 
                        checked={data.cookie_banner_enabled} 
                        onChange={(val) => handleChange('cookie_banner_enabled', typeof val === 'boolean' ? val : val.target.checked)} 
                    />
                </div>
                {data.cookie_banner_enabled && (
                    <div className="mt-6 pt-6 border-t border-(--platform-border-color) animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-(--platform-text-primary) mb-2">
                            Текст банера
                        </label>
                        <textarea
                            className="w-full bg-(--platform-input-bg) border border-(--platform-border-color) rounded-lg p-3 text-(--platform-text-primary) text-sm focus:border-(--platform-accent) focus:ring-1 focus:ring-(--platform-accent) transition-all outline-none resize-y min-h-25"
                            value={data.cookie_banner_text}
                            onChange={(e) => handleChange('cookie_banner_text', e.target.value)}
                            placeholder="Введіть текст для Cookie банера..."
                        />
                    </div>
                )}
            </div>
            {!isStaff && (
                <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                                <CreditCard size={22} className="text-(--platform-accent)" /> Налаштування оплати (LiqPay)
                            </h3>
                            <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                                Додайте ваші ключі LiqPay, щоб почати приймати платежі на сайті.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div>
                            <Input
                                label="Public Key (Публічний ключ)"
                                value={data.liqpay_public_key}
                                onChange={(e) => handleChange('liqpay_public_key', e.target.value)}
                                placeholder="sandbox_..."
                                leftIcon={<Key size={16}/>}
                            />
                        </div>
                        <div>
                            <Input
                                label="Private Key (Приватний ключ)"
                                value={data.liqpay_private_key}
                                onChange={(e) => handleChange('liqpay_private_key', e.target.value)}
                                placeholder="sandbox_..."
                                leftIcon={<Lock size={16}/>}
                                type="password"
                            />
                        </div>
                        {(!data.liqpay_public_key || !data.liqpay_private_key) && (
                            <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#ef4444', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <AlertCircle size={16} style={{flexShrink: 0}} />
                                <span>Ключі не налаштовані. Клієнти не зможуть оплачувати замовлення.</span>
                            </div>
                        )}
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                            <Button 
                                type="button" 
                                onClick={() => toast.success('Налаштування LiqPay успішно збережено!')}
                                icon={<Check size={18} />}
                            >
                                Зберегти зміни
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {!isStaff && !isLocked && (
                <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Globe size={22} className="text-(--platform-accent)" /> Статус сайту
                        </h3>
                        <div className="max-w-md mx-auto mt-4">
                            <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm">
                                Поточний статус
                            </label>
                            <CustomSelect 
                                name="status"
                                value={data.status} 
                                onChange={(e) => handleChange('status', e.target.value)}
                                options={statusOptions}
                                disabled={statusCooldown > 0} 
                            />
                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                                <Button 
                                    type="button" 
                                    onClick={handleStatusSave}
                                    disabled={statusCooldown > 0} 
                                    icon={statusCooldown > 0 ? <Timer size={18} /> : <Check size={18} />}
                                >
                                    {statusCooldown > 0 ? `Зачекайте ${statusCooldown}с` : 'Зберегти зміни'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GeneralIdentitySection;