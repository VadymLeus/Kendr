// frontend/src/shared/lib/utils/mediaUtils.js
import { File, FileText, Sheet, Presentation, Type, Image, Video, Music } from 'lucide-react';

export const API_URL = 'http://localhost:5000';
export const checkeredStyle = {
    backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    backgroundColor: '#ffffff'
};

export const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toUpperCase();
};

export const getFileConfig = (file) => {
    const ext = getFileExtension(file.original_file_name);
    let config = {
        IconComponent: File,
        themeColor: 'var(--platform-text-secondary)',
        bgColor: 'var(--platform-card-bg)', 
        badgeBg: 'rgba(0,0,0,0.05)',
        type: 'other'
    };

    if (file.mime_type.startsWith('image/')) {
        config.type = 'image';
        return config;
    }
    
    if (file.mime_type.startsWith('video/')) {
        config.type = 'video';
        return config;
    }

    switch (ext) {
        case 'PDF':
            config.IconComponent = FileText;
            config.themeColor = '#e53e3e';
            config.bgColor = 'rgba(229, 62, 62, 0.08)';
            config.badgeBg = 'rgba(229, 62, 62, 0.15)';
            config.type = 'document';
            break;
        case 'DOC': case 'DOCX':
            config.IconComponent = FileText;
            config.themeColor = '#2b6cb0';
            config.bgColor = 'rgba(43, 108, 176, 0.08)';
            config.badgeBg = 'rgba(43, 108, 176, 0.15)';
            config.type = 'document';
            break;
        case 'XLS': case 'XLSX': case 'CSV':
            config.IconComponent = Sheet;
            config.themeColor = '#2f855a';
            config.bgColor = 'rgba(47, 133, 90, 0.08)';
            config.badgeBg = 'rgba(47, 133, 90, 0.15)';
            config.type = 'document';
            break;
        case 'PPT': case 'PPTX':
            config.IconComponent = Presentation;
            config.themeColor = '#dd6b20';
            config.bgColor = 'rgba(221, 107, 32, 0.08)';
            config.badgeBg = 'rgba(221, 107, 32, 0.15)';
            config.type = 'document';
            break;
        case 'TTF': case 'OTF': case 'WOFF': case 'WOFF2':
            config.IconComponent = Type;
            config.themeColor = '#38a169';
            config.bgColor = 'rgba(56, 161, 105, 0.08)';
            config.badgeBg = 'rgba(56, 161, 105, 0.15)';
            config.type = 'font';
            break;
        case 'MP3': case 'WAV': case 'OGG':
            config.IconComponent = Music;
            config.themeColor = '#805ad5';
            config.bgColor = 'rgba(128, 90, 213, 0.08)';
            config.badgeBg = 'rgba(128, 90, 213, 0.15)';
            config.type = 'audio';
            break;
        default:
            config.IconComponent = File;
            config.themeColor = '#718096';
            config.bgColor = 'rgba(113, 128, 150, 0.08)';
            config.badgeBg = 'rgba(113, 128, 150, 0.15)';
            config.type = 'other';
            break;
    }

    return config;
};