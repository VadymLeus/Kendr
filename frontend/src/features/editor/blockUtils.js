// frontend/src/features/editor/blockUtils.js
import { produce } from 'immer';
import { get, set, unset } from 'lodash';

const getPathString = (path) => path.join('.');

export const findBlockByPath = (blocks, path) => {
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
            else console.error("Не вдалося знайти батьківський масив для видалення", parentPath);
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
            else console.error("Не вдалося знайти батьківський масив для додавання", parentPath);
        }
    });
};

export const moveBlock = (blocks, dragPath, hoverPath) => {
    return produce(blocks, draft => {
        const dragBlock = get(draft, getPathString(dragPath));
        if (!dragBlock) {
            console.error("Не вдалося знайти блок для переміщення", dragPath);
            return;
        }
        
        const dragParentPath = dragPath.slice(0, -1);
        const dragIndex = dragPath[drag.length - 1];
        let parent = draft;
        if (dragParentPath.length > 0) parent = get(draft, getPathString(dragParentPath));
        parent.splice(dragIndex, 1);

        const hoverParentPath = hoverPath.slice(0, -1);
        const hoverIndex = hoverPath[hoverPath.length - 1];
        let hoverParent = draft;
        if (hoverParentPath.length > 0) hoverParent = get(draft, getPathString(hoverParentPath));
        hoverParent.splice(hoverIndex, 0, dragBlock);
    });
};

export const handleDrop = (blocks, dragItem, dropPath) => {
    const dragPath = dragItem.path;
    const targetBlockList = get(blocks, getPathString(dropPath));

    if (!Array.isArray(targetBlockList)) {
        console.error("Місце для скидання не є масивом!", dropPath);
        return blocks;
    }

    const hoverPath = [...dropPath, targetBlockList.length];
    return moveBlock(blocks, dragPath, hoverPath);
};