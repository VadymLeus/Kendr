// frontend/src/shared/ui/complex/PaymentMethodModal.jsx
import React, { useEffect } from 'react';
import GooglePayButton from '@google-pay/button-react';
import { Button } from '../elements/Button';
import { X, CreditCard, Loader2 } from 'lucide-react';

const PaymentMethodModal = ({ 
    isOpen, 
    onClose, 
    amount,
    currencySymbol = '₴',
    isLoading,
    onSelectLiqPay,
    gpayConfig
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-30000 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={!isLoading ? onClose : undefined}
            />
            <div className="bg-(--platform-card-bg) border-t sm:border border-(--platform-border-color) rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden bg-black/5 dark:bg-white/5 absolute top-0 left-0">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>

                <div className="px-5 sm:px-6 py-4 pt-8 sm:pt-4 border-b border-(--platform-border-color) flex justify-between items-center bg-black/5 dark:bg-white/5">
                    <h3 className="text-xl font-bold text-(--platform-text-primary)">
                        Спосіб оплати
                    </h3>
                    <button 
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-(--platform-text-secondary) hover:text-(--platform-text-primary) hover:bg-(--platform-border-color) p-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5 sm:p-6 overflow-y-auto pb-8 sm:pb-6">
                    {amount && (
                        <div className="text-center mb-6">
                            <p className="text-(--platform-text-secondary) text-sm mb-1">До сплати</p>
                            <p className="text-3xl sm:text-4xl font-extrabold text-(--platform-text-primary)">
                                {amount} {currencySymbol}
                            </p>
                        </div>
                    )}
                    <div className="space-y-4">
                        <Button 
                            variant="outline"
                            className="w-full h-14 relative flex items-center justify-center gap-3 border-2 border-[#77B139]/30 hover:border-[#77B139] hover:bg-[#77B139]/5 text-(--platform-text-primary) font-bold text-base sm:text-lg transition-all rounded-xl"
                            onClick={onSelectLiqPay}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin text-[#77B139]" size={24} />
                            ) : (
                                <>
                                    <CreditCard className="text-[#77B139] shrink-0" size={24} />
                                    <span className="truncate">Оплатити карткою (LiqPay)</span>
                                </>
                            )}
                        </Button>
                        <div className="relative flex items-center py-2">
                            <div className="grow border-t border-(--platform-border-color)"></div>
                            <span className="shrink-0 mx-4 text-(--platform-text-secondary) text-xs sm:text-sm font-medium uppercase tracking-wider">або</span>
                            <div className="grow border-t border-(--platform-border-color)"></div>
                        </div>
                        <div className={`w-full rounded-xl overflow-hidden shadow-sm transition-opacity min-h-14 flex items-center justify-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <GooglePayButton
                                environment="TEST"
                                paymentRequest={{
                                    apiVersion: 2,
                                    apiVersionMinor: 0,
                                    allowedPaymentMethods: [
                                        {
                                            type: 'CARD',
                                            parameters: {
                                                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                                allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                            },
                                            tokenizationSpecification: {
                                                type: 'PAYMENT_GATEWAY',
                                                parameters: {
                                                    gateway: 'example',
                                                    gatewayMerchantId: 'exampleGatewayMerchantId',
                                                },
                                            },
                                        },
                                    ],
                                    merchantInfo: {
                                        merchantId: '12345678901234567890',
                                        merchantName: gpayConfig?.merchantName || 'Kendr Platform',
                                    },
                                    transactionInfo: {
                                        totalPriceStatus: 'FINAL',
                                        totalPriceLabel: 'Разом до сплати',
                                        totalPrice: gpayConfig?.totalPrice || '0.00',
                                        currencyCode: 'UAH',
                                        countryCode: 'UA',
                                    },
                                }}
                                onLoadPaymentData={gpayConfig?.onSuccess}
                                buttonColor="black"
                                buttonType="buy"
                                buttonSizeMode="fill"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodModal;