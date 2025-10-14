// frontend/src/features/favorites/FavoritesContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../../services/api';
import { AuthContext } from '../auth/AuthContext';

export const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
    const [favoriteSiteIds, setFavoriteSiteIds] = useState(new Set());
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            apiClient.get('/favorites/ids')
                .then(response => {
                    setFavoriteSiteIds(new Set(response.data));
                })
                .catch(err => console.error("Не вдалося завантажити обрані сайти:", err));
        } else {
            setFavoriteSiteIds(new Set()); // Очищаємо при виході
        }
    }, [user]);

    const addFavorite = async (siteId) => {
        await apiClient.post(`/favorites/${siteId}`);
        setFavoriteSiteIds(prev => new Set(prev).add(siteId));
    };

    const removeFavorite = async (siteId) => {
        await apiClient.delete(`/favorites/${siteId}`);
        setFavoriteSiteIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(siteId);
            return newSet;
        });
    };

    return (
        <FavoritesContext.Provider value={{ favoriteSiteIds, addFavorite, removeFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};