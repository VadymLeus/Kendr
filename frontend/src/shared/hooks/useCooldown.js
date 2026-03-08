// frontend/src/shared/hooks/useCooldown.js
import { useState, useEffect, useCallback } from 'react';
export const useCooldown = (storageKey) => {
    const [cooldown, setCooldown] = useState(() => {
        const savedTime = localStorage.getItem(storageKey);
        if (savedTime) {
            const remaining = Math.ceil((parseInt(savedTime) - Date.now()) / 1000);
            return remaining > 0 ? remaining : 0;
        }
        return 0;
    });
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
        } else if (cooldown === 0) {
            const savedTime = localStorage.getItem(storageKey);
            if (savedTime && Date.now() > parseInt(savedTime)) {
                localStorage.removeItem(storageKey);
            }
        }
        return () => clearTimeout(timer);
    }, [cooldown, storageKey]);
    const startCooldown = useCallback((seconds) => {
        setCooldown(seconds);
        localStorage.setItem(storageKey, (Date.now() + seconds * 1000).toString());
    }, [storageKey]);

    return [cooldown, startCooldown];
};