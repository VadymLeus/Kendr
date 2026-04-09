// frontend/src/shared/hooks/useAutoSave.js
import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../api/api';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

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
        setData((prevData) => {
            const newData = { ...prevData, [field]: value };
            if (JSON.stringify(newData) !== JSON.stringify(lastSavedData)) {
                setIsSaving(true);
                debouncedSave(newData);
            }
            return newData;
        });
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