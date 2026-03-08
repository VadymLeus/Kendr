// frontend/src/modules/dashboard/features/settings/components/GeneralVisualsSection.jsx
import React, { useState } from 'react';
import UniversalMediaInput from '../../../../../shared/ui/complex/UniversalMediaInput';
import SiteCoverDisplay from '../../../../../shared/ui/complex/SiteCoverDisplay';
import { Tag, X, Check, Image, Upload, Trash } from 'lucide-react';

const GeneralVisualsSection = ({ 
    data, 
    handleChange, 
    availableTags, 
    selectedTags, 
    handleTagToggle, 
    setSelectedTags, 
    siteData, 
    identityData, 
    getImageUrl 
}) => {
    const [isCoverHovered, setIsCoverHovered] = useState(false);
    return (
        <>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <div className="mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Tag size={22} className="text-(--platform-accent)" /> SEO та Теги
                        </h3>
                    </div>
                </div>
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2.5">
                        <label className="font-medium text-(--platform-text-primary) text-sm m-0 flex items-center gap-1.5">
                            <Tag size={16} /> Категорії / Теги 
                            <span className={`text-xs px-1.5 py-0.5 rounded border border-(--platform-border-color) bg-(--platform-bg) ${selectedTags.length >= 5 ? 'text-(--platform-warning)' : 'text-(--platform-text-secondary)'}`}>
                                {selectedTags.length}/5
                            </span>
                        </label>
                        <button 
                            type="button" 
                            className="w-7 h-7 rounded-md border border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-secondary) flex items-center justify-center cursor-pointer transition-colors hover:bg-(--platform-danger) hover:border-(--platform-danger) hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => { setSelectedTags([]); handleChange('tags', []); }} 
                            title="Очистити всі теги" 
                            disabled={selectedTags.length === 0}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 bg-(--platform-bg) rounded-xl border border-(--platform-border-color)">
                        {availableTags.map(tag => {
                            const isActive = selectedTags.includes(tag.id);
                            return ( 
                                <button 
                                    key={tag.id} 
                                    onClick={() => handleTagToggle(tag.id)} 
                                    type="button" 
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium cursor-pointer transition-all duration-200 h-8
                                        ${isActive 
                                            ? 'border-(--platform-accent) bg-(--platform-accent) text-white' 
                                            : 'border-(--platform-border-color) bg-(--platform-bg) text-(--platform-text-secondary) hover:border-(--platform-accent) hover:text-(--platform-text-primary)'
                                        }
                                    `}
                                >
                                    {isActive && <Check size={14} />} {tag.name}
                                </button> 
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="bg-(--platform-card-bg) rounded-2xl border border-(--platform-border-color) p-8 mb-6 shadow-sm">
                <div className="mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-(--platform-text-primary) m-0 mb-1 flex items-center gap-2.5">
                            <Image size={22} className="text-(--platform-accent)" /> Розумна Обкладинка
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                            Налаштуйте вигляд картки так, як вона виглядатиме в каталозі.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-8">
                    <div className="flex justify-center bg-(--platform-bg) border border-(--platform-border-color) rounded-xl p-8 bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-repeat">
                        <div className="relative group">
                            <div style={{ width: '320px', height: '200px', transform: 'scale(1.2)', transformOrigin: 'center', transition: 'transform 0.3s' }} className="shadow-2xl rounded-lg overflow-hidden border border-(--platform-border-color)">
                                <UniversalMediaInput 
                                    type="image"
                                    value={data.cover_image} 
                                    aspect={1.6} 
                                    onChange={(val) => {
                                        const newVal = val && val.target ? val.target.value : val;
                                        handleChange('cover_image', newVal);
                                    }}
                                    triggerStyle={{ display: 'block', padding: 0, border: 'none', background: 'transparent', width: '100%', height: '100%', cursor: 'pointer' }}
                                >
                                    <div 
                                        className="w-full h-full relative"
                                        onMouseEnter={() => setIsCoverHovered(true)} 
                                        onMouseLeave={() => setIsCoverHovered(false)}
                                    >
                                        <SiteCoverDisplay site={{
                                            ...siteData,
                                            title: identityData.title,
                                            logo_url: getImageUrl(data.logo_url),
                                            cover_image: getImageUrl(data.cover_image),
                                            cover_layout: data.cover_layout,
                                            cover_logo_radius: data.cover_logo_radius,
                                            cover_logo_size: data.cover_logo_size,
                                            cover_title_size: data.cover_title_size
                                        }} style={{ width: '100%', height: '100%' }} />
                                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[2px] z-10 ${isCoverHovered ? 'opacity-100' : 'opacity-0'}`}>
                                            <div className="flex items-center gap-2 font-medium text-sm"><Upload size={16} /> Змінити фон</div>
                                        </div>
                                        {data.cover_image && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleChange('cover_image', ''); }}
                                                className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center cursor-pointer z-20 transition-colors hover:bg-(--platform-danger) border-none"
                                                title="Видалити зображення"
                                            >
                                                <Trash size={12} />
                                            </button>
                                        )}
                                    </div>
                                </UniversalMediaInput>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeneralVisualsSection;