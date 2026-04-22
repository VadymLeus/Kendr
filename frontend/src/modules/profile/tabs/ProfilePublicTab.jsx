// frontend/src/modules/profile/tabs/ProfilePublicTab.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../app/providers/AuthContext';
import apiClient from '../../../shared/api/api';
import { toast } from 'react-toastify';
import { Input, Button } from '../../../shared/ui/elements'; 
import { useCooldown } from '../../../shared/hooks/useCooldown';
import { Globe, Send, Instagram, Copy, ExternalLink, Eye, EyeOff, Check, Timer } from 'lucide-react';

const PublicProfileTab = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        bio: user.bio || '',
        social_telegram: user.social_telegram || '',
        social_instagram: user.social_instagram || '',
        social_website: user.social_website || '',
        is_profile_public: Boolean(user.is_profile_public)
    });
    const [publicCooldown, startPublicCooldown] = useCooldown('kendr_public_update_cooldown');
    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (publicCooldown > 0) {
            toast.warning(`Зачекайте ${publicCooldown}с перед наступним оновленням.`);
            return;
        }
        const cleanBio = formData.bio.trim().replace(/[<>]/g, '').slice(0, 300);
        const cleanTelegram = formData.social_telegram.trim().replace(/[<>]/g, '');
        const cleanInstagram = formData.social_instagram.trim().replace(/[<>]/g, '');
        let website = formData.social_website.trim();
        if (website && !/^https?:\/\//i.test(website)) {
            toast.error('Сайт повинен починатися з http:// або https://');
            return;
        }
        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                bio: cleanBio,
                social_telegram: cleanTelegram,
                social_instagram: cleanInstagram,
                social_website: website
            };
            const response = await apiClient.put('/users/profile', payload);
            updateUser(response.data.user);
            setFormData(payload);
            toast.success('Публічний профіль оновлено!');
            startPublicCooldown(30);
        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message || 'Помилка збереження');
        } finally { 
            setIsLoading(false); 
        }
    };
    
    const profileUrl = `${window.location.origin}/profile/${user.slug}`;
    const copyLink = () => {
        navigator.clipboard.writeText(profileUrl);
        toast.info('Посилання скопійовано');
    };
    
    const openLink = () => {
        window.open(profileUrl, '_blank');
    };
    
    const hasChanges = 
        formData.bio !== (user.bio || '') ||
        formData.social_telegram !== (user.social_telegram || '') ||
        formData.social_instagram !== (user.social_instagram || '') ||
        formData.social_website !== (user.social_website || '') ||
        formData.is_profile_public !== Boolean(user.is_profile_public);
    return (
        <div className="w-full max-w-225 mx-auto">
            <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-2xl p-5 sm:p-6 mb-5 sm:mb-6 flex flex-col shadow-sm">
                <div className="flex justify-between items-center gap-4 sm:gap-5">
                    <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-(--platform-text-primary) mb-1.5 flex items-center gap-2 m-0">
                            {formData.is_profile_public ? <Eye size={20} className="text-(--platform-accent)" /> : <EyeOff size={20} className="text-(--platform-text-secondary)" />}
                            Статус профілю
                        </h3>
                        <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                            {formData.is_profile_public 
                                ? 'Ваш профіль видимий для всіх користувачів.' 
                                : 'Ваш профіль прихований. Його бачите лише ви.'}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                            type="checkbox" 
                            name="is_profile_public"
                            className="sr-only peer" 
                            checked={formData.is_profile_public} 
                            onChange={handleChange} 
                        />
                        <div className="w-11 h-6 bg-(--platform-border-color) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--platform-accent) shadow-sm"></div>
                    </label>
                </div>
                {Boolean(formData.is_profile_public) && (
                    <div className="bg-(--platform-bg) border border-(--platform-border-color) rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-5 gap-3 sm:gap-4">
                        <a 
                            href={profileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="font-mono text-sm whitespace-nowrap overflow-hidden text-ellipsis text-(--platform-accent) no-underline flex-1 px-1 sm:px-0"
                            title={profileUrl}
                        >
                            {profileUrl}
                        </a>
                        <div className="flex gap-2 shrink-0">
                            <Button 
                                type="button"
                                variant="secondary" 
                                onClick={copyLink} 
                                title="Копіювати посилання"
                                icon={<Copy size={18} />}
                                className="flex-1 sm:flex-none justify-center px-4"
                            />
                            <Button 
                                type="button"
                                variant="secondary" 
                                onClick={openLink} 
                                title="Відкрити у новій вкладці"
                                icon={<ExternalLink size={18} />}
                                className="flex-1 sm:flex-none justify-center px-4"
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-(--platform-card-bg) border border-(--platform-border-color) rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-(--platform-text-primary) mb-1.5 flex items-center gap-2 m-0">
                        <Globe size={20} className="text-(--platform-accent)" />
                        Соціальні мережі та Біо
                    </h3>
                    <p className="text-sm text-(--platform-text-secondary) m-0 leading-relaxed">
                        Ця інформація буде відображена на вашій публічній сторінці.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex justify-between items-center pr-1">
                            <label className="text-sm font-medium text-(--platform-text-primary) ml-1">
                                Про себе
                            </label>
                            <span className={`text-xs ${formData.bio.length >= 300 ? 'text-(--platform-danger) font-bold' : 'text-(--platform-text-secondary)'}`}>
                                {formData.bio.length}/300
                            </span>
                        </div>
                        <textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleChange}
                            maxLength={300}
                            placeholder="Розкажіть трохи про себе, ваші навички та інтереси..."
                            className="w-full p-3.5 sm:p-4 rounded-xl border border-(--platform-border-color) bg-(--platform-input-bg) text-(--platform-text-primary) text-sm sm:text-base resize-y min-h-30 max-h-75 outline-none transition-all duration-200 focus:border-(--platform-accent) focus:ring-[3px] focus:ring-(--platform-accent)/15 custom-scrollbar"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        <Input 
                            name="social_telegram" 
                            label="Telegram" 
                            value={formData.social_telegram} 
                            onChange={handleChange}
                            leftIcon={<Send size={18} />}
                            placeholder="@username"
                        />
                        <Input 
                            name="social_instagram" 
                            label="Instagram" 
                            value={formData.social_instagram} 
                            onChange={handleChange}
                            leftIcon={<Instagram size={18} />}
                            placeholder="@username"
                        />
                    </div>
                    <Input 
                        name="social_website" 
                        label="Особистий сайт" 
                        value={formData.social_website} 
                        onChange={handleChange}
                        leftIcon={<Globe size={18} />}
                        placeholder="https://mysite.com"
                        helperText="Обов'язково має починатися з http:// або https://"
                    />
                    <div className="mt-2 pt-5 border-t border-(--platform-border-color) flex justify-center w-full">
                        <Button 
                            type="submit" 
                            disabled={isLoading || publicCooldown > 0 || !hasChanges} 
                            icon={isLoading ? null : (publicCooldown > 0 ? <Timer size={18} /> : <Check size={18} />)}
                            className="w-full sm:w-auto min-h-11"
                        >
                            {isLoading ? 'Збереження...' : (publicCooldown > 0 ? `Зачекайте ${publicCooldown}с` : 'Зберегти зміни')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublicProfileTab;