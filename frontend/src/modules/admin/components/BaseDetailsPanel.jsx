// frontend/src/modules/admin/components/BaseDetailsPanel.jsx
import React from 'react';
import { Button } from '../../../shared/ui/elements/Button';
import { X, Trash } from 'lucide-react';

const BaseDetailsPanel = ({ title, onClose, onDelete, deleteLabel = "Видалити", deleteDisabled = false, deleteTitle, children }) => {
    return (
        <>
            <div 
                className="fixed inset-0 bg-black/30 z-49 backdrop-blur-sm" 
                onClick={onClose} 
            />
            <div 
                className="fixed top-0 right-0 bottom-0 w-full sm:w-112.5 bg-(--platform-card-bg) border-l border-(--platform-border-color) shadow-2xl z-50 flex flex-col"
                style={{ animation: 'slideInRight 0.3s ease' }}
            >
                <div className="p-5 sm:px-6 border-b border-(--platform-border-color) flex justify-between items-center bg-(--platform-bg)">
                    <h2 className="text-lg font-bold text-(--platform-text-primary) m-0">{title}</h2>
                    <Button 
                        variant="ghost" 
                        onClick={onClose} 
                        icon={<X size={20} />} 
                        className="w-8 h-8 p-0 flex justify-center items-center text-(--platform-text-secondary) hover:text-(--platform-text-primary)" 
                    />
                </div>
                <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
                {onDelete && (
                    <div className="p-5 sm:p-6 border-t border-(--platform-border-color) bg-(--platform-bg) flex flex-col gap-3">
                        <Button 
                            variant="danger" 
                            onClick={onDelete}
                            icon={<Trash size={18} />}
                            disabled={deleteDisabled}
                            title={deleteTitle}
                            className="w-full justify-center"
                        >
                            {deleteLabel}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

export default BaseDetailsPanel;