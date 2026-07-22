import { useState, useEffect } from 'react';

/**
 * Debounces a value by specified delay in ms.
 * Useful for search inputs to prevent excessive API calls.
 *
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
