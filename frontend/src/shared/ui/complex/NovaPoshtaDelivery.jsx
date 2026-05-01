// frontend/src/shared/ui/complex/NovaPoshtaDelivery.jsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/api';
import { Input } from '../elements/Input';
import { MapPin, Loader2, Search, Building } from 'lucide-react';

const NovaPoshtaDelivery = ({ value, onChange, required }) => {
    const [citySearch, setCitySearch] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [warehouseSearch, setWarehouseSearch] = useState('');
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isWarehousesLoading, setIsWarehousesLoading] = useState(false);
    const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);
    const cityRef = useRef(null);
    const warehouseRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cityRef.current && !cityRef.current.contains(e.target)) setShowCityDropdown(false);
            if (warehouseRef.current && !warehouseRef.current.contains(e.target)) setShowWarehouseDropdown(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (selectedCity && selectedWarehouse) {
            onChange(`Нова Пошта: м. ${selectedCity.description}, ${selectedWarehouse.description}`);
        } else {
            onChange('');
        }
    }, [selectedCity, selectedWarehouse]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            setIsCitiesLoading(true);
            try {
                const res = await apiClient.get(`/delivery/cities?search=${encodeURIComponent(citySearch)}`);
                setCities(res.data);
            } catch (err) {
                console.error('Failed to load cities', err);
            } finally {
                setIsCitiesLoading(false);
            }
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [citySearch]);

    useEffect(() => {
        if (!selectedCity) return;
        const delayDebounceFn = setTimeout(async () => {
            setIsWarehousesLoading(true);
            try {
                const res = await apiClient.get(`/delivery/warehouses?cityRef=${selectedCity.ref}&search=${encodeURIComponent(warehouseSearch)}`);
                setWarehouses(res.data);
            } catch (err) {
                console.error('Failed to load warehouses', err);
            } finally {
                setIsWarehousesLoading(false);
            }
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [warehouseSearch, selectedCity]);

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setCitySearch(city.description);
        setShowCityDropdown(false);
        setSelectedWarehouse(null);
        setWarehouseSearch('');
    };

    const handleWarehouseSelect = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setWarehouseSearch(warehouse.description);
        setShowWarehouseDropdown(false);
    };

    return (
        <div className="space-y-4 relative z-20">
            <div className="relative" ref={cityRef}>
                <Input
                    label="Місто доставки (Нова Пошта)"
                    leftIcon={<Search size={18} />}
                    rightIcon={isCitiesLoading && <Loader2 size={16} className="animate-spin text-(--platform-accent)" />}
                    placeholder="Наприклад: Київ"
                    value={citySearch}
                    onChange={(e) => {
                        setCitySearch(e.target.value);
                        setShowCityDropdown(true);
                        if (selectedCity && e.target.value !== selectedCity.description) {
                            setSelectedCity(null);
                            setSelectedWarehouse(null);
                            setWarehouseSearch('');
                        }
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    required={required && !selectedCity}
                />
                {showCityDropdown && cities.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl shadow-lg z-50 custom-scrollbar">
                        {cities.map((city) => (
                            <div 
                                key={city.ref}
                                onClick={() => handleCitySelect(city)}
                                className="px-4 py-2 hover:bg-(--platform-hover-bg) cursor-pointer text-sm text-(--platform-text-primary) transition-colors flex items-center gap-2"
                            >
                                <MapPin size={14} className="text-(--platform-text-secondary)" />
                                {city.description}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className={`relative transition-opacity ${!selectedCity ? 'opacity-50 pointer-events-none' : ''}`} ref={warehouseRef}>
                <Input
                    label="Відділення / Поштомат"
                    leftIcon={<Building size={18} />}
                    rightIcon={isWarehousesLoading && <Loader2 size={16} className="animate-spin text-(--platform-accent)" />}
                    placeholder={selectedCity ? "Введіть номер або адресу відділення" : "Спочатку оберіть місто"}
                    value={warehouseSearch}
                    onChange={(e) => {
                        setWarehouseSearch(e.target.value);
                        setShowWarehouseDropdown(true);
                        if (selectedWarehouse && e.target.value !== selectedWarehouse.description) {
                            setSelectedWarehouse(null);
                        }
                    }}
                    onFocus={() => setShowWarehouseDropdown(true)}
                    required={required && selectedCity && !selectedWarehouse}
                    disabled={!selectedCity}
                />
                {showWarehouseDropdown && warehouses.length > 0 && selectedCity && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-(--platform-card-bg) border border-(--platform-border-color) rounded-xl shadow-lg z-50 custom-scrollbar">
                        {warehouses.map((warehouse) => (
                            <div 
                                key={warehouse.ref}
                                onClick={() => handleWarehouseSelect(warehouse)}
                                className="px-4 py-2 hover:bg-(--platform-hover-bg) cursor-pointer text-sm text-(--platform-text-primary) transition-colors border-b border-(--platform-border-color) last:border-0"
                            >
                                {warehouse.description}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <input type="hidden" value={value || ''} required={required} />
        </div>
    );
};

export default NovaPoshtaDelivery;