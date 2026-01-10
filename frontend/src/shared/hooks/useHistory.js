// frontend/src/common/hooks/useHistory.js
import { useState, useCallback } from 'react';

const useHistory = (initialState) => {
    const [past, setPast] = useState([]);
    
    const [present, setPresent] = useState(initialState);
    
    const [future, setFuture] = useState([]);

    const setState = useCallback((newState, isHistoryEvent = true) => {
        const resolvedState = typeof newState === 'function' ? newState(present) : newState;

        if (isHistoryEvent) {
            if (JSON.stringify(present) === JSON.stringify(resolvedState)) {
                return;
            }
            setPast((prev) => [...prev, present]);
            setFuture([]);
        }
        setPresent(resolvedState);
    }, [present]);

    const undo = useCallback(() => {
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture((prev) => [present, ...prev]);
        setPresent(previous);
        setPast(newPast);
    }, [past, present]);

    const redo = useCallback(() => {
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast((prev) => [...prev, present]);
        setPresent(next);
        setFuture(newFuture);
    }, [future, present]);

    return [
        present,
        setState,
        undo,
        redo,
        {
            canUndo: past.length > 0,
            canRedo: future.length > 0,
            history: past 
        }
    ];
};

export default useHistory;