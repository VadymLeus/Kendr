// frontend/src/modules/dashboard/features/commerce/components/CommerceSettingsTab.jsx
import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../../../../shared/ui/elements';
import CustomSelect from '../../../../../shared/ui/elements/CustomSelect';
import { CreditCard, Key, Lock, AlertCircle, Check, Banknote } from 'lucide-react';
import apiClient from '../../../../../shared/api/api';
import { toast } from 'react-toastify';

const CURRENCY_OPTIONS = [
    { value: 'UAH', label: 'Гривня – ₴', icon: Banknote },
    { value: 'USD', label: 'Долар – $', icon: Banknote },
    { value: 'EUR', label: 'Євро – €', icon: Banknote }
];

const CommerceSettingsTab = ({ siteData, onSavingChange }) => {
    const [currency, setCurrency] = useState(siteData?.currency || 'UAH');
    const [localLiqpay, setLocalLiqpay] = useState({
        public: siteData?.liqpay_public_key || '',
        private: siteData?.liqpay_private_key || ''
    });

    useEffect(() => {
        setLocalLiqpay({
            public: siteData?.liqpay_public_key || '',
            private: siteData?.liqpay_private_key || ''
        });
    }, [siteData?.liqpay_public_key, siteData?.liqpay_private_key]);

    const handleCurrencyChange = async (e) => {
        const newCurrency = e.target.value;
        setCurrency(newCurrency);
        onSavingChange(true);
        try {
            await apiClient.put(`/sites/${siteData.site_path}/settings`, { currency: newCurrency });
            toast.success("Валюту магазину оновлено!");
        } catch (error) {
            console.error(error);
            toast.error("Не вдалося оновити валюту.");
            setCurrency(siteData.currency || 'UAH');
        } finally {
            onSavingChange(false);
        }
    };

    const handleLiqpaySave = async () => {
        onSavingChange(true);
        try {
            await apiClient.put(`/sites/${siteData.site_path}/settings`, {
                liqpay_public_key: localLiqpay.public,
                liqpay_private_key: localLiqpay.private
            });
            toast.success('Налаштування LiqPay успішно збережено!');
        } catch (error) {
            console.error(error);
            toast.error('Не вдалося зберегти налаштування оплати.');
        } finally {
            onSavingChange(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-1 flex flex-col gap-6">
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 shadow-sm w-full max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Banknote size={22} className="text-(--platform-accent)" /> Валюта магазину
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                            Оберіть основну валюту, в якій будуть відображатися ціни на товари та суми замовлень.
                        </p>
                    </div>
                </div>
                <div className="max-w-xs mx-auto">
                    <label className="block mb-2 font-medium text-(--platform-text-primary) text-sm text-center w-full">
                        Поточна валюта
                    </label>
                    <CustomSelect 
                        value={currency} 
                        onChange={handleCurrencyChange}
                        options={CURRENCY_OPTIONS}
                    />
                </div>
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 shadow-sm w-full max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <CreditCard size={22} className="text-(--platform-accent)" /> Налаштування оплати
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                            Додайте ваші ключі LiqPay, щоб почати приймати платежі на сайті.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
                    <div>
                        <Input
                            label={<div className="text-center w-full">Public Key</div>}
                            value={localLiqpay.public}
                            onChange={(e) => setLocalLiqpay(prev => ({ ...prev, public: e.target.value }))}
                            placeholder="sandbox_..."
                            leftIcon={<Key size={16}/>}
                        />
                    </div>
                    <div>
                        <Input
                            label={<div className="text-center w-full">Private Key</div>}
                            value={localLiqpay.private}
                            onChange={(e) => setLocalLiqpay(prev => ({ ...prev, private: e.target.value }))}
                            placeholder="sandbox_..."
                            leftIcon={<Lock size={16}/>}
                            type="password"
                        />
                    </div>
                    {(!siteData?.liqpay_public_key || !siteData?.liqpay_private_key) && (
                        <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#ef4444', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <AlertCircle size={16} style={{flexShrink: 0}} />
                            <span>Ключі не налаштовані. Клієнти не зможуть оплачувати замовлення.</span>
                        </div>
                    )}
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                        <Button 
                            type="button" 
                            onClick={handleLiqpaySave}
                            icon={<Check size={18} />}
                        >
                            Зберегти зміни
                        </Button>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default CommerceSettingsTab;