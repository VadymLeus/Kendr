// frontend/src/hooks/useHistory.js
import { useState, useCallback } from 'react';

const useHistory = (initialState) => {
    // Історія: масив минулих станів
    const [past, setPast] = useState([]);
    
    // Сьогодення: поточний стан
    const [present, setPresent] = useState(initialState);
    
    // Майбутнє: масив станів, які ми скасували (для Redo)
    const [future, setFuture] = useState([]);

    // 1. Функція зміни стану (аналог setState)
    // isHistoryEvent = true означає, що цю зміну треба запам'ятати
    const setState = useCallback((newState, isHistoryEvent = true) => {
        // Якщо newState - це функція (як у стандартному useState), викликаємо її
        const resolvedState = typeof newState === 'function' ? newState(present) : newState;

        if (isHistoryEvent) {
            // Якщо новий стан ідентичний поточному, не записуємо в історію
            if (JSON.stringify(present) === JSON.stringify(resolvedState)) {
                return;
            }
            setPast((prev) => [...prev, present]); // Записуємо поточне в минуле
            setFuture([]); // Майбутнє стирається, якщо ми зробили щось нове
        }
        setPresent(resolvedState);
    }, [present]);

    // 2. UNDO (Назад)
    const undo = useCallback(() => {
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture((prev) => [present, ...prev]); // Поточне йде в майбутнє
        setPresent(previous); // Минуле стає сьогоденням
        setPast(newPast);
    }, [past, present]);

    // 3. REDO (Вперед)
    const redo = useCallback(() => {
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast((prev) => [...prev, present]); // Поточне йде в минуле
        setPresent(next); // Майбутнє стає сьогоденням
        setFuture(newFuture);
    }, [future, present]);

    return [
        present,    // Поточний стан (blocks)
        setState,   // Функція оновлення (setBlocks)
        undo,       // Функція Назад
        redo,       // Функція Вперед
        {
            canUndo: past.length > 0,
            canRedo: future.length > 0,
            history: past 
        }
    ];
};

export default useHistory;