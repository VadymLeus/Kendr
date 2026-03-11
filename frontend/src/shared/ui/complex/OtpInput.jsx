// frontend/src/shared/ui/complex/OtpInput.jsx
import React, { useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, value = '', onChange, disabled = false }) => {
    const inputRefs = useRef([]);
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, length);
    }, [length]);
    const handleChange = (e, index) => {
        const val = e.target.value;
        if (/[^0-9]/.test(val) && val !== '') return;
        const char = val.slice(-1);
        const newOtp = value.split('');
        newOtp[index] = char;
        const combined = newOtp.join('');
        onChange(combined);
        if (char && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!value[index] && index > 0) {
                const newOtp = value.split('');
                newOtp[index - 1] = '';
                onChange(newOtp.join(''));
                inputRefs.current[index - 1]?.focus();
            } else {
                const newOtp = value.split('');
                newOtp[index] = '';
                onChange(newOtp.join(''));
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
        if (pastedData) {
            onChange(pastedData);
            const focusIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[focusIndex]?.focus();
        }
    };
    const otpArray = value.padEnd(length, ' ').split('').slice(0, length);
    return (
        <div 
            className="flex justify-between gap-2 sm:gap-3 w-full" 
            onPaste={handlePaste}
        >
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={2}
                    value={otpArray[i].trim()}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    disabled={disabled}
                    className={`
                        w-full h-12 sm:h-14 text-center text-xl font-bold bg-(--platform-input-bg) 
                        border border-(--platform-border-color) rounded-xl text-(--platform-text-primary)
                        focus:border-(--platform-accent) focus:ring-2 focus:ring-(--platform-accent)/20 outline-none
                        transition-all duration-200 shadow-sm
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-(--platform-hover-bg)' : ''}
                    `}
                />
            ))}
        </div>
    );
};

export default OtpInput;