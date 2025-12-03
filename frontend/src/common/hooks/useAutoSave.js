// frontend/src/common/hooks/useAutoSave.js
import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../services/api';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

/**
 * Хук для автозбереження даних форми
 * @param {string} endpoint - API endpoint (наприклад, `/sites/mysite/settings`)
 * @param {object} initialData - Початкові дані
 * @param {function} onSaveCallback - колбек після успішного збереження
 */
export const useAutoSave = (endpoint, initialData, onSaveCallback) => {
    const [data, setData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedData, setLastSavedData] = useState(initialData);
    
    const dataRef = useRef(data);

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const saveData = async (dataToSave) => {
        setIsSaving(true);
        try {
            await apiClient.put(endpoint, dataToSave);
            setLastSavedData(dataToSave);
            
            if (onSaveCallback) onSaveCallback(dataToSave);
        } catch (error) {
            console.error("Autosave error:", error);
            toast.error('Помилка автозбереження');
        } finally {
            setIsSaving(false);
        }
    };

    const debouncedSave = useCallback(
        debounce((newData) => {
            saveData(newData);
        }, 1000),
        [endpoint]
    );

    const handleChange = (field, value) => {
        const newData = { ...data, [field]: value };
        setData(newData);
        
        if (JSON.stringify(newData) !== JSON.stringify(lastSavedData)) {
            setIsSaving(true);
            debouncedSave(newData);
        }
    };

    const updateAll = (newData) => {
        setData(newData);
        setIsSaving(true);
        debouncedSave(newData);
    };

    return {
        data,
        setData,
        handleChange,
        updateAll,
        isSaving
    };
};