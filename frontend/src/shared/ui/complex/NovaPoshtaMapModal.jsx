// frontend/src/shared/ui/complex/NovaPoshtaMapModal.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import apiClient from '../../api/api';
import { Input } from '../elements/Input';
import { Button } from '../elements/Button';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { X, Search, MapPin, Loader2, CheckCircle2, Navigation } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 13);
    }, [center, map]);
    return null;
};

const POPULAR_CITIES = [
    'Київ', 'Львів', 'Одеса', 'Дніпро', 
    'Харків', 'Запоріжжя', 'Житомир', 
    'Вінниця', 'Івано-Франківськ', 'Тернопіль'
];

const NovaPoshtaMapModal = ({ isOpen, onClose, onSelect }) => {
    const [citySearch, setCitySearch] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [isWarehousesLoading, setIsWarehousesLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState([50.4501, 30.5234]); 
    useEffect(() => {
        if (!isOpen) return;
        const delayDebounceFn = setTimeout(async () => {
            if (citySearch.length < 2 || selectedCity) {
                if (!selectedCity) setCities([]);
                return;
            }
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
    }, [citySearch, isOpen, selectedCity]);

    useEffect(() => {
        const fetchWarehouses = async () => {
            if (!selectedCity) return;
            setIsWarehousesLoading(true);
            try {
                const res = await apiClient.get(`/delivery/warehouses?cityRef=${selectedCity.ref}`);
                setWarehouses(res.data);
                if (res.data.length > 0) {
                    setMapCenter([parseFloat(res.data[0].latitude), parseFloat(res.data[0].longitude)]);
                }
            } catch (err) {
                console.error('Failed to load warehouses', err);
            } finally {
                setIsWarehousesLoading(false);
            }
        };
        fetchWarehouses();
    }, [selectedCity]);

    const handlePopularCityClick = async (cityName) => {
        setCitySearch(cityName);
        setIsCitiesLoading(true);
        try {
            const res = await apiClient.get(`/delivery/cities?search=${encodeURIComponent(cityName)}`);
            if (res.data && res.data.length > 0) {
                const exactMatch = res.data.find(c => c.description === cityName) || res.data[0];
                setSelectedCity(exactMatch);
                setCities([]);
            }
        } catch (err) {
            console.error('Failed to load popular city', err);
        } finally {
            setIsCitiesLoading(false);
        }
    };

    if (!isOpen) return null;
    const handleConfirm = (warehouse) => {
        onSelect(`Нова Пошта: м. ${selectedCity.description}, ${warehouse.description}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-(--platform-bg) w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
                <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col border-r border-(--platform-border-color) bg-(--platform-card-bg)">
                    <div className="p-4 border-b border-(--platform-border-color) flex items-center justify-between">
                        <h2 className="text-lg font-bold text-(--platform-text-primary) flex items-center gap-2">
                            <MapPin className="text-(--platform-accent)" /> Вибір відділення
                        </h2>
                        <button onClick={onClose} className="md:hidden p-2 text-(--platform-text-secondary) hover:bg-(--platform-hover-bg) rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
                        <Input
                            placeholder="Введіть назву міста..."
                            value={citySearch}
                            onChange={(e) => {
                                setCitySearch(e.target.value);
                                if (selectedCity && e.target.value !== selectedCity.description) {
                                    setSelectedCity(null);
                                    setWarehouses([]);
                                }
                            }}
                            leftIcon={<Search size={18} />}
                            rightIcon={isCitiesLoading && <Loader2 size={16} className="animate-spin text-(--platform-accent)" />}
                        />
                        {!selectedCity && citySearch.length < 2 && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-2">
                                <h3 className="text-xs font-semibold text-(--platform-text-secondary) uppercase tracking-wider mb-3 ml-1 flex items-center gap-1.5">
                                    <Navigation size={12} /> Популярні міста
                                </h3>
                                <div className="flex flex-col gap-1">
                                    {POPULAR_CITIES.map((city) => (
                                        <button
                                            key={city}
                                            type="button"
                                            onClick={() => handlePopularCityClick(city)}
                                            className="text-left px-3 py-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-(--platform-text-primary) text-sm font-medium transition-colors flex items-center justify-between group"
                                        >
                                            <span className="flex items-center gap-2">
                                                <MapPin size={16} className="text-(--platform-text-secondary) group-hover:text-(--platform-accent) transition-colors" />
                                                {city}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {!selectedCity && citySearch.length >= 2 && cities.length > 0 && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar border border-(--platform-border-color) rounded-xl">
                                {cities.map((city) => (
                                    <div 
                                        key={city.ref}
                                        onClick={() => {
                                            setSelectedCity(city);
                                            setCitySearch(city.description);
                                            setCities([]);
                                        }}
                                        className="p-3 hover:bg-(--platform-hover-bg) cursor-pointer text-sm text-(--platform-text-primary) border-b border-(--platform-border-color) last:border-0"
                                    >
                                        {city.description}
                                    </div>
                                ))}
                            </div>
                        )}
                        {!selectedCity && citySearch.length >= 2 && cities.length === 0 && !isCitiesLoading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-(--platform-text-secondary) p-4">
                                <Search size={32} className="opacity-20 mb-2" />
                                <p className="text-sm">Місто не знайдено. Перевірте правильність написання.</p>
                            </div>
                        )}
                        {selectedCity && isWarehousesLoading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-(--platform-text-secondary)">
                                <Loader2 size={32} className="animate-spin mb-2 text-(--platform-accent)" />
                                <p className="text-sm">Завантаження відділень...</p>
                            </div>
                        )}
                        {selectedCity && !isWarehousesLoading && warehouses.length > 0 && (
                            <div className="flex-1 bg-(--platform-accent)/10 border border-(--platform-accent)/20 rounded-xl p-4 text-center flex flex-col justify-center">
                                <MapPin size={32} className="mx-auto mb-2 text-(--platform-accent)" />
                                <h3 className="font-bold text-(--platform-text-primary) mb-1">Місто знайдено!</h3>
                                <p className="text-sm text-(--platform-text-secondary)">Оберіть зручне відділення на карті праворуч та натисніть "Вибрати".</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full md:w-2/3 h-1/2 md:h-full relative bg-zinc-100 dark:bg-zinc-900">
                    <button onClick={onClose} className="hidden md:flex absolute top-4 right-4 z-400 bg-(--platform-card-bg) shadow-md p-2 text-(--platform-text-secondary) hover:text-(--platform-text-primary) rounded-full transition-colors border border-(--platform-border-color)">
                        <X size={20} />
                    </button>
                    <MapContainer center={mapCenter} zoom={12} className="w-full h-full z-10">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater center={mapCenter} />
                        
                        {warehouses.map((w) => (
                            <Marker key={w.ref} position={[parseFloat(w.latitude), parseFloat(w.longitude)]}>
                                <Popup className="custom-popup">
                                    <div className="p-1 min-w-50">
                                        <p className="font-bold text-sm mb-3 leading-tight">{w.description}</p>
                                        <Button 
                                            size="sm" 
                                            className="w-full bg-(--platform-accent) text-white hover:opacity-90 shadow-sm border-none transition-all"
                                            onClick={() => handleConfirm(w)}
                                        >
                                            <CheckCircle2 size={16} className="mr-2" /> Вибрати це відділення
                                        </Button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

            </div>
        </div>
    );
};

export default NovaPoshtaMapModal;