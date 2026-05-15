// frontend/src/shared/ui/complex/TemplateBadge.jsx
import React from 'react';
import { EyeOff, Globe, Shield, Lock, User, Users } from 'lucide-react';

const badgeBaseClass = "flex items-center gap-1.5 w-max text-[10px] px-2 py-1 rounded-md font-medium tracking-wide backdrop-blur-md shadow-sm border border-white/10 bg-black/60 text-gray-100";
const TemplateBadge = ({ template, user, isAdmin, sourceTab }) => {
    if (!isAdmin && sourceTab === 'system') return null;
    if (sourceTab === 'system') {
        const isMine = template.user_id === user?.id || template.author_id === user?.id;
        const isDraft = !template.is_ready;
        const isPublic = template.access_level === 'public';
        return (
            <>
                <span className={badgeBaseClass}>
                    {isDraft ? <EyeOff size={12} className="text-orange-400" /> : 
                     isPublic ? <Globe size={12} className="text-emerald-400" /> : 
                     <Shield size={12} className="text-blue-400" />}
                    {isDraft ? 'Чернетка' : (isPublic ? 'Публічний' : 'На перевірці')}
                </span>
                {isAdmin && (
                    <span className={badgeBaseClass}>
                        {isMine ? <User size={12} className="text-indigo-400" /> : <Users size={12} className="text-gray-400" />}
                        {isMine ? 'Власний' : 'Від інших'}
                    </span>
                )}
            </>
        );
    }
    return (
        <span className={badgeBaseClass}>
            <Lock size={12} className="text-gray-400" /> Приватний
        </span>
    );
};

export default TemplateBadge;