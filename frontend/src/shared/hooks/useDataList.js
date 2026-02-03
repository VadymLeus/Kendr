// frontend/src/shared/hooks/useDataList.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/api';

export const useDataList = (endpoint, searchFields = []) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(endpoint);
            setData(response.data);
        } catch (error) {
            console.error(error);
            toast.error('Помилка завантаження даних');
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const lowerQ = searchQuery.toLowerCase();
        
        return data.filter(item => {
            return searchFields.some(field => {
                const value = item[field];
                return value && String(value).toLowerCase().includes(lowerQ);
            });
        });
    }, [data, searchQuery, searchFields]);

    return {
        data,
        filteredData,
        loading,
        searchQuery,
        setSearchQuery,
        refresh: fetchData
    };
};