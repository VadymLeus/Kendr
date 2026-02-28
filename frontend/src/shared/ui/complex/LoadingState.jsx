// frontend/src/shared/ui/complex/LoadingState.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ 
    title = 'Завантаження...', 
    description, 
    layout = 'page',
    iconSize = 56,
    className = ''
}) => {
    const layoutClasses = layout === 'page' 
        ? 'min-h-[60vh] flex-col' 
        : 'py-10 flex-col';

    return (
        <div className={`flex items-center justify-center gap-5 p-4 text-center w-full h-full ${layoutClasses} ${className}`}>
            <Loader2 
                size={iconSize} 
                className="animate-spin text-(--platform-accent) shrink-0" 
            />
            
            <div className="flex flex-col items-center gap-2">
                <h2 className={`${layout === 'page' ? 'text-2xl' : 'text-lg'} font-bold text-(--platform-text-primary) m-0`}>
                    {title}
                </h2>
                
                {description && (
                    <p className="text-(--platform-text-secondary) text-base max-w-md m-0">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoadingState;