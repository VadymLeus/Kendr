// frontend/src/shared/ui/complex/DragDropWrapper.jsx
import React, { useState, useRef } from 'react';

const DragDropWrapper = ({
    onDropFiles,
    disabled = false,
    overlayText = "Перетягніть файли сюди",
    errorText = "Неможливо завантажити",
    isError = false,
    children,
    style = {},
    className = ''
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);
    const handleDrag = (e, active) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;

        if (active !== undefined) {
            if (active) dragCounter.current += 1;
            else dragCounter.current -= 1;
            setIsDragging(dragCounter.current > 0);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;

        setIsDragging(false);
        dragCounter.current = 0;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onDropFiles(files);
        }
    };
    return (
        <div
            style={style}
            className={className}
            onDragEnter={(e) => handleDrag(e, true)}
            onDragLeave={(e) => handleDrag(e, false)}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleDrop}
        >
            {isDragging && !isError && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 200,
                    backgroundColor: 'color-mix(in srgb, var(--platform-accent), transparent 90%)',
                    border: '4px dashed var(--platform-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--platform-accent)', fontSize: '1.5rem', fontWeight: 'bold', pointerEvents: 'none',
                    margin: '1rem', borderRadius: '16px'
                }}>
                    {overlayText}
                </div>
            )}
            {isDragging && isError && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 200,
                    backgroundColor: 'color-mix(in srgb, var(--platform-danger), transparent 90%)',
                    border: '4px dashed var(--platform-danger)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--platform-danger)', fontSize: '1.5rem', fontWeight: 'bold', pointerEvents: 'none',
                    margin: '1rem', borderRadius: '16px'
                }}>
                    {errorText}
                </div>
            )}
            {children}
        </div>
    );
};

export default DragDropWrapper;