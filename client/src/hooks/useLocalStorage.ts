import { useState, useCallback, useRef } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Use a ref to always have the freshest value available for functional updates.
    // This avoids the stale-closure problem when setValue is called rapidly in succession.
    const latestRef = useRef(storedValue);
    latestRef.current = storedValue;

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(latestRef.current) : value;

            latestRef.current = valueToStore;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    }, [key]);

    return [storedValue, setValue] as const;
}
