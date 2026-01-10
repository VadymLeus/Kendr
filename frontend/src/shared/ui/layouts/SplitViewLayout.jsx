// frontend/src/shared/ui/layouts/SplitViewLayout.jsx
import React, { useState, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '../elements/Icons';
export const SplitViewLayout = ({ 
    sidebar,
    content,
    isOpen,
    onToggle,
    sidebarWidth = '450px',
    breakPoint = 1100
}) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < breakPoint;
    
    const effectiveIsOpen = isOpen; 

    const styles = {
        container: { 
            display: 'flex', 
            height: '692px', 
            overflow: 'hidden', 
            position: 'relative',
            alignItems: 'stretch'
        },
        sidebarArea: {
            flex: 1, 
            minWidth: 0, 
            display: 'flex', 
            flexDirection: 'column',
            opacity: (isMobile && effectiveIsOpen) ? 0.3 : 1,
            pointerEvents: (isMobile && effectiveIsOpen) ? 'none' : 'auto',
            transition: 'opacity 0.3s'
        },
        collapseBtn: {
            width: '32px',
            height: '692px',
            margin: '0 8px', 
            background: 'var(--platform-bg)',
            display: isMobile ? 'none' : 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer', 
            color: 'var(--platform-text-secondary)', 
            transition: 'all 0.2s ease',
            flexShrink: 0, 
            border: '1px solid var(--platform-border-color)', 
            borderRadius: '8px', 
            zIndex: 10,
            alignSelf: 'center'
        },
        contentArea: {
            width: isMobile ? '100%' : (effectiveIsOpen ? sidebarWidth : '0px'),
            minWidth: isMobile ? '100%' : (effectiveIsOpen ? sidebarWidth : '0px'),
            position: isMobile ? 'absolute' : 'relative',
            right: 0, top: 0, bottom: 0, zIndex: 50,
            transform: isMobile ? (effectiveIsOpen ? 'translateX(0)' : 'translateX(100%)') : 'none',
            opacity: isMobile ? 1 : (effectiveIsOpen ? 1 : 0),
            transition: 'all 0.3s ease', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            boxShadow: isMobile && effectiveIsOpen ? '-5px 0 25px rgba(0,0,0,0.1)' : 'none'
        }
    };

    return (
        <div style={styles.container}>
            <style>{`.collapse-btn-hover:hover { border-color: var(--platform-accent) !important; color: var(--platform-accent) !important; background: var(--platform-bg); box-shadow: 0 0 0 1px var(--platform-accent); }`}</style>
            
            <div style={styles.sidebarArea}>
                {sidebar}
            </div>

            <div style={styles.collapseBtn} onClick={() => onToggle(!isOpen)} className="collapse-btn-hover">
                {isOpen ? <IconChevronRight size={20} /> : <IconChevronLeft size={20} />}
            </div>

            <div style={styles.contentArea}>
                {React.isValidElement(content) 
                    ? React.cloneElement(content, { isMobile }) 
                    : content}
            </div>
        </div>
    );
};