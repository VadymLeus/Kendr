// frontend/src/common/utils/themeUtils.js
export const PRESET_COLORS = [
    { id: 'green', color: '#48bb78', name: 'Зелений' },
    { id: 'orange', color: '#ed8936', name: 'Помаранчевий' },
    { id: 'blue', color: '#4299e1', name: 'Синій' },
    { id: 'red', color: '#f56565', name: 'Червоний' },
    { id: 'purple', color: '#9f7aea', name: 'Фіолетовий' },
    { id: 'yellow', color: '#ecc94b', name: 'Жовтий' },
    { id: 'gray', color: '#718096', name: 'Сірий' },
    { id: 'black', color: '#000000', name: 'Чорний' },
];

export const resolveAccentColor = (val) => {
    const preset = PRESET_COLORS.find(p => p.id === val);
    return preset ? preset.color : (val || '#ed8936');
};

export const isLightColor = (hexColor) => {
    if (!hexColor) return false;
    if (!hexColor.startsWith('#')) {
        hexColor = resolveAccentColor(hexColor);
    }
    
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128;
};

export const adjustColor = (hex, percent) => {
    if (!hex) return hex;
    if (!hex.startsWith('#')) {
        hex = resolveAccentColor(hex);
    }

    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
};