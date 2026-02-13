// frontend/src/shared/lib/utils/siteExporter.js
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateFullHTML } from './htmlGenerator';
import apiClient from '../api/api';
import { BASE_URL } from '../config';

const getAbsoluteUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('data:')) return null;
    if (url.startsWith('blob:')) return null;
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `${BASE_URL}/${cleanPath}`;
};

const collectMediaStrings = (obj, foundStrings = new Set()) => {
    if (!obj) return foundStrings;
    if (typeof obj === 'string') {
        if (obj.match(/\.(jpeg|jpg|gif|png|webp|svg|ico|mp4|webm|mov|avi)/i) || obj.includes('/uploads/')) {
            foundStrings.add(obj);
        }
    } else if (Array.isArray(obj)) {
        obj.forEach(item => collectMediaStrings(item, foundStrings));
    } else if (typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            const isMediaKey = [
                'url', 'src', 'href', 
                'bg_image', 'cover_image', 'image', 'imageUrl', 
                'bg_video', 'video', 'poster', 
                'logo_src', 'logo_url', 'favicon_url'
            ].includes(key) || key.toLowerCase().includes('image') || key.toLowerCase().includes('video');
            
            if (isMediaKey && typeof obj[key] === 'string' && obj[key].length > 0) {
                foundStrings.add(obj[key]);
            } else {
                collectMediaStrings(obj[key], foundStrings);
            }
        });
    }
    return foundStrings;
};

const downloadFile = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return await response.blob();
    } catch (error) {
        console.warn(`[Exporter] Failed to download: ${url}`, error);
        return null;
    }
};

const replaceStringsInObject = (obj, mapOriginalToLocal) => {
    if (!obj) return obj;
    if (typeof obj === 'string') {
        if (mapOriginalToLocal.has(obj)) {
            return mapOriginalToLocal.get(obj);
        }
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.map(item => replaceStringsInObject(item, mapOriginalToLocal));
    } else if (typeof obj === 'object') {
        const newObj = {};
        Object.keys(obj).forEach(key => {
            newObj[key] = replaceStringsInObject(obj[key], mapOriginalToLocal);
        });
        return newObj;
    }
    return obj;
};

export const exportSiteToZip = async (initialSiteData) => {
    console.log("[Exporter] Starting export process...");
    try {
        const zip = new JSZip();
        const siteId = initialSiteData.id;
        const pagesRes = await apiClient.get(`/sites/${siteId}/pages`);
        const allPagesMeta = pagesRes.data; 
        const pagesContentMap = {}; 
        for (const page of allPagesMeta) {
            try {
                const res = await apiClient.get(`/pages/${page.id}`);
                let content = res.data.block_content;
                
                if (typeof content === 'string') {
                    try {
                        content = JSON.parse(content);
                    } catch (e) {
                        console.error(`Failed to parse blocks for page ${page.id}`, e);
                        content = [];
                    }
                }
                
                pagesContentMap[page.id] = content || [];
            } catch (e) {
                console.error(`[Exporter] Error loading page ${page.slug}`, e);
                pagesContentMap[page.id] = [];
            }
        }

        const allMediaStrings = new Set();
        collectMediaStrings(initialSiteData, allMediaStrings);
        if (initialSiteData.header_content) collectMediaStrings(initialSiteData.header_content, allMediaStrings);
        if (initialSiteData.footer_content) collectMediaStrings(initialSiteData.footer_content, allMediaStrings);
        Object.values(pagesContentMap).forEach(blocks => collectMediaStrings(blocks, allMediaStrings));
        const assetsFolder = zip.folder("assets");
        const mapOriginalToLocal = new Map(); 
        const uniqueStrings = Array.from(allMediaStrings);
        console.log(`[Exporter] Found ${uniqueStrings.length} media files to download.`);
        const downloadPromises = uniqueStrings.map(async (originalString, index) => {
            const absoluteUrl = getAbsoluteUrl(originalString);
            if (!absoluteUrl) return;
            const blob = await downloadFile(absoluteUrl);
            if (blob) {
                let ext = 'jpg';
                const match = originalString.match(/\.(jpeg|jpg|gif|png|webp|svg|mp4|webm|mov|avi)/i);
                if (match) {
                    ext = match[1];
                } else if (blob.type) {
                    if (blob.type.includes('video')) ext = 'mp4';
                    else if (blob.type.includes('png')) ext = 'png';
                    else if (blob.type.includes('svg')) ext = 'svg';
                }
                
                const filename = `media_${index}.${ext}`;
                assetsFolder.file(filename, blob);
                mapOriginalToLocal.set(originalString, `assets/${filename}`);
            }
        });

        await Promise.all(downloadPromises);
        const localizedSiteData = replaceStringsInObject(initialSiteData, mapOriginalToLocal);
        const isDark = localizedSiteData.site_theme_mode === 'dark';
        const theme = localizedSiteData.theme_settings || {};
        const cssContent = `
            :root {
                --site-accent: ${theme.accentColor || '#3b82f6'};
                --site-bg: ${theme.backgroundColor || (isDark ? '#1a202c' : '#ffffff')};
                --site-text-primary: ${theme.textColor || (isDark ? '#f7fafc' : '#1a202c')};
                --site-text-secondary: ${isDark ? '#a0aec0' : '#4a5568'};
                --site-card-bg: ${isDark ? '#2d3748' : '#ffffff'};
                --site-header-bg: ${theme.backgroundColor || (isDark ? '#1a202c' : '#ffffff')};
                --site-border-color: ${isDark ? '#4a5568' : '#e2e8f0'};
            }
            body { 
                background-color: var(--site-bg); 
                color: var(--site-text-primary); 
                font-family: 'Inter', sans-serif; 
                margin: 0;
            }
            img, video { max-width: 100%; display: block; }
            a { text-decoration: none; color: inherit; }
            .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
            [data-lucide] { width: 24px; height: 24px; display: inline-block; stroke-width: 2; }
            .static-slider {
                display: flex;
                overflow-x: auto;
                gap: 16px;
                scroll-snap-type: x mandatory;
                padding-bottom: 10px;
                -webkit-overflow-scrolling: touch;
            }
            .static-slider > div {
                flex: 0 0 100%;
                scroll-snap-align: center;
                width: 100%;
            }
            .static-slider::-webkit-scrollbar { height: 6px; }
            .static-slider::-webkit-scrollbar-thumb { background: var(--site-accent); border-radius: 3px; }
        `;
        
        zip.folder("css").file("style.css", cssContent);

        for (const page of allPagesMeta) {
            const originalBlocks = pagesContentMap[page.id];
            const localizedBlocks = replaceStringsInObject(originalBlocks, mapOriginalToLocal);
            const filename = page.is_homepage ? 'index.html' : `${page.slug}.html`;
            const html = generateFullHTML(localizedSiteData, localizedBlocks, page.title);
            zip.file(filename, html);
        }

        zip.file("README.txt", "Exported from Kendr Website Builder.\n\nTo view your site, open index.html in any browser.");
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${initialSiteData.site_path || 'website'}_export.zip`);
        return true;
    } catch (error) {
        console.error("[Exporter] Critical Error:", error);
        throw error;
    }
};