// frontend/src/shared/ui/complex/TemplateBadge.jsx
import React from 'react';
import { EyeOff, Globe, Shield, Lock } from 'lucide-react';

const TemplateBadge = ({ template, user, isAdmin, sourceTab }) => {
    if (!isAdmin && sourceTab === 'system') return null;
    if (sourceTab === 'system') {
        const isMine = template.user_id === user?.id || template.author_id === user?.id;
        const isDraft = !template.is_ready;
        const isPublic = template.access_level === 'public';
        return (
            <div className="flex gap-1 z-10 relative">
                <span className={`flex items-center gap-1 w-max text-[10px] px-2 py-0.5 rounded-md font-bold uppercase backdrop-blur-md shadow-sm border ${
                    isDraft ? 'bg-orange-500/90 text-white border-orange-600/50' :
                    isPublic ? 'bg-green-500/90 text-white border-green-600/50' : 'bg-blue-500/90 text-white border-blue-600/50'
                }`}>
                    {isDraft ? <EyeOff size={10} /> : isPublic ? <Globe size={10} /> : <Shield size={10} />}
                    {isDraft ? 'Чернетка' : (isPublic ? 'Публічний' : 'На перевірці')}
                </span>
                {isAdmin && (
                    <span className={`flex items-center gap-1 w-max text-[10px] px-2 py-0.5 rounded-md font-bold uppercase backdrop-blur-md shadow-sm border ${
                        isMine ? 'bg-indigo-500/90 text-white border-indigo-600/50' : 'bg-gray-600/90 text-white border-gray-700/50'
                    }`}>
                        {isMine ? 'Власний' : 'Від інших'}
                    </span>
                )}
            </div>
        );
    }
    return (
        <div className="z-10 relative">
            <span className="bg-gray-800/90 text-white border-gray-900/50 flex items-center gap-1 w-max text-[10px] px-2 py-0.5 rounded-md font-bold uppercase backdrop-blur-md shadow-sm border">
                <Lock size={10} /> Приватний
            </span>
        </div>
    );
};

export default TemplateBadge;