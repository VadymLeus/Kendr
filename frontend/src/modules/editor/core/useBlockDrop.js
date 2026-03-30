// frontend/src/modules/editor/core/useBlockDrop.js
import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';

export const DND_TYPE_EXISTING = 'BLOCK';
export const DND_TYPE_NEW = 'NEW_BLOCK';
export const useBlockDrop = ({
    ref,
    path,
    onMoveBlock,
    onAddBlock,
    canDropOnSelf = false 
}) => {
    const [dropPosition, setDropPosition] = useState(null);
    const [{ isOver, handlerId }, drop] = useDrop({
        accept: [DND_TYPE_EXISTING, DND_TYPE_NEW],
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
                isOver: monitor.isOver({ shallow: true }), 
            };
        },
        hover(item, monitor) {
            if (!ref.current) return;
            if (!monitor.isOver({ shallow: true })) {
                setDropPosition(null);
                return;
            }
            const dragPath = item.path;
            const hoverPath = path;
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            let newPosition = hoverClientY < hoverMiddleY ? 'top' : 'bottom';
            if (dragPath && item.type !== DND_TYPE_NEW) {
                const dragIndex = dragPath[dragPath.length - 1];
                const hoverIndex = hoverPath[hoverPath.length - 1];
                const isSameParent = dragPath.slice(0, -1).join(',') === hoverPath.slice(0, -1).join(',');
                if (isSameParent) {
                    if (dragIndex === hoverIndex) {
                        setDropPosition('center');
                        return;
                    }
                    if (newPosition === 'bottom' && hoverIndex === dragIndex - 1) {
                        setDropPosition(null);
                        return;
                    }
                    if (newPosition === 'top' && hoverIndex === dragIndex + 1) {
                        setDropPosition(null);
                        return;
                    }
                }
            }
            setDropPosition(newPosition);
        },
        drop(item, monitor) {
            const currentPos = dropPosition; 
            setDropPosition(null);
            if (monitor.didDrop()) return;
            if (!currentPos) return;
            const dragType = monitor.getItemType();
            if (dragType === DND_TYPE_NEW && onAddBlock && monitor.isOver({ shallow: true })) {
                const currentPathIndex = path[path.length - 1];
                const parentPath = path.slice(0, -1);
                let insertIndex = currentPathIndex;
                if (currentPos === 'bottom') {
                    insertIndex = currentPathIndex + 1;
                }
                const insertPath = [...parentPath, insertIndex];
                onAddBlock(insertPath, item.blockType, item.presetData);
                return { handled: true };
            }

            if (dragType === DND_TYPE_EXISTING && onMoveBlock && monitor.isOver({ shallow: true })) {
                const dragPath = item.path;
                const hoverPath = path;
                if (dragPath.join(',') === hoverPath.join(',')) return;
                const parentPath = hoverPath.slice(0, -1);
                const dragParentPath = dragPath.slice(0, -1);
                const hoverIndex = hoverPath[hoverPath.length - 1];
                const dragIndex = dragPath[dragPath.length - 1];
                let targetIndex = hoverIndex;
                if (currentPos === 'bottom') {
                    targetIndex = hoverIndex + 1;
                }
                const isSameParent = dragParentPath.join(',') === parentPath.join(',');
                if (isSameParent && dragIndex < hoverIndex) {
                    targetIndex -= 1;
                }
                const targetPath = [...parentPath, targetIndex];
                onMoveBlock(dragPath, targetPath);
                item.path = targetPath;
            }
        }
    });

    useEffect(() => {
        if (!isOver) setDropPosition(null);
    }, [isOver]);

    return {
        drop,
        dropPosition,
        handlerId,
        isOver
    };
};