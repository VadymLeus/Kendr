// frontend/src/shared/ui/layouts/SplitViewLayout.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const SplitViewLayout = ({ 
    sidebar, content, isOpen, onToggle, 
    sidebarWidth = '450px', breakPoint = 1100
}) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < breakPoint;
    const effectiveIsOpen = isOpen;
    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative', alignItems: 'stretch' }}>
            <div style={{
                flex: 1, 
                minWidth: 0, 
                display: 'flex', 
                flexDirection: 'column',
                opacity: (isMobile && effectiveIsOpen) ? 0.3 : 1,
                pointerEvents: (isMobile && effectiveIsOpen) ? 'none' : 'auto',
                transition: 'opacity 0.3s'
            }}>
                {sidebar}
            </div>

            {!isMobile && (
                <div 
                    style={{
                        width: '32px', 
                        position: 'relative',
                        zIndex: 20,
                        display: 'flex',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0
                    }}
                >
                    <button
                        onClick={() => onToggle(!isOpen)}
                        title={isOpen ? "Згорнути" : "Розгорнути"}
                        className="group flex items-center justify-center w-6 h-48 bg-(--platform-card-bg) border border-(--platform-border-color) rounded-full shadow-sm cursor-pointer transition-all duration-200 hover:border-(--platform-accent) hover:text-(--platform-accent) hover:shadow-md focus:outline-none z-20"
                        style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <div className="transition-transform duration-200 group-hover:scale-110">
                            {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </div>
                    </button>
                </div>
            )}
            <div style={{
                width: isMobile ? '100%' : (effectiveIsOpen ? sidebarWidth : '0px'),
                minWidth: isMobile ? '100%' : (effectiveIsOpen ? sidebarWidth : '0px'),
                position: isMobile ? 'absolute' : 'relative',
                right: 0, top: 0, bottom: 0, zIndex: 50,
                transform: isMobile ? (effectiveIsOpen ? 'translateX(0)' : 'translateX(100%)') : 'none',
                opacity: isMobile ? 1 : (effectiveIsOpen ? 1 : 0),
                transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)', 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                boxShadow: isMobile && effectiveIsOpen ? '-5px 0 25px rgba(0,0,0,0.1)' : 'none',
                paddingLeft: isMobile ? 0 : 0 
            }}>
                {React.isValidElement(content) 
                    ? React.cloneElement(content, { isMobile }) 
                    : content}
            </div>
        </div>
    );
};