// frontend/src/modules/editor/core/blockUtils.js
import { produce } from 'immer';
import { get } from 'lodash';

const getPathString = (path) => path.join('.');

export const findBlockByPath = (blocks, path) => {
    if (!path) return null;
    return get(blocks, getPathString(path), null);
};

export const updateBlockDataByPath = (blocks, path, newData) => {
    return produce(blocks, draft => {
        const block = get(draft, getPathString(path));
        if (block) block.data = newData;
    });
};

export const removeBlockByPath = (blocks, path) => {
    return produce(blocks, draft => {
        const parentPath = path.slice(0, -1);
        const index = path[path.length - 1];
        
        if (parentPath.length === 0) {
            draft.splice(index, 1);
        } else {
            const parent = get(draft, getPathString(parentPath));
            if (parent && Array.isArray(parent)) parent.splice(index, 1);
        }
    });
};

export const addBlockByPath = (blocks, newBlock, path) => {
    return produce(blocks, draft => {
        const parentPath = path.slice(0, -1);
        const index = path[path.length - 1];

        if (parentPath.length === 0) {
            draft.splice(index, 0, newBlock);
        } else {
            const parent = get(draft, getPathString(parentPath));
            if (parent && Array.isArray(parent)) parent.splice(index, 0, newBlock);
        }
    });
};

export const moveBlock = (blocks, dragPath, hoverPath) => {
    return produce(blocks, draft => {
        if (!dragPath || !hoverPath || !Array.isArray(dragPath) || !Array.isArray(hoverPath)) return;

        const dragBlock = get(draft, getPathString(dragPath));
        if (!dragBlock) {
            return;
        }
        
        const dragParentPath = dragPath.slice(0, -1);
        const dragIndex = dragPath[dragPath.length - 1];
        
        let parent = draft;
        if (dragParentPath.length > 0) parent = get(draft, getPathString(dragParentPath));
        
        if (!parent || !Array.isArray(parent) || !parent[dragIndex]) return;

        const [movedItem] = parent.splice(dragIndex, 1);

        const hoverParentPath = hoverPath.slice(0, -1);
        const hoverIndex = hoverPath[hoverPath.length - 1];
        
        let hoverParent = draft;
        if (hoverParentPath.length > 0) hoverParent = get(draft, getPathString(hoverParentPath));

        if (hoverParent && Array.isArray(hoverParent)) {
            hoverParent.splice(hoverIndex, 0, movedItem);
        }
    });
};

export const handleDrop = (blocks, dragItem, dropPath) => {
    const dragPath = dragItem.path;
    const targetBlockList = get(blocks, getPathString(dropPath));

    if (Array.isArray(targetBlockList)) {
        const hoverPath = [...dropPath, targetBlockList.length];
        return moveBlock(blocks, dragPath, hoverPath);
    }
    
    return blocks;
};

export const generateNewId = () => {
    return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const cloneBlockWithNewIds = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => cloneBlockWithNewIds(item));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (key === 'block_id' || (key === 'id' && typeof obj[key] === 'string' && (obj[key].startsWith('id-') || obj[key].length > 20))) {
                    newObj[key] = generateNewId();
                } else {
                    newObj[key] = cloneBlockWithNewIds(obj[key]);
                }
            }
        }
        return newObj;
    }
    return obj;
};