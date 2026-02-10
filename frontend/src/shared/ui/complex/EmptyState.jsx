// frontend/src/shared/ui/complex/EmptyState.jsx
import React from 'react';
import { Search } from 'lucide-react';

const EmptyState = ({ 
    icon: Icon = Search,
    title = "Нічого не знайдено", 
    description, 
    action 
}) => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-75 text-(--platform-text-secondary) text-center p-5">
            <div className="p-10 border-2 border-dashed border-(--platform-border-color) rounded-2xl flex flex-col items-center w-full max-w-100 bg-(--platform-bg)">
                <Icon size={48} className="opacity-30 mb-4" />
                
                <h3 className="m-0 mb-2 text-lg font-semibold text-(--platform-text-primary)">
                    {title}
                </h3>
                
                {description && (
                    <p className="m-0 mb-5 text-sm opacity-80">
                        {description}
                    </p>
                )}
                
                {action && (
                    <div className="mt-2">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmptyState;