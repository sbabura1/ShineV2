import { useEffect, useState } from 'react';

export function useSavedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(`scalaris:${key}`);
      return saved === null ? initialValue : JSON.parse(saved);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`scalaris:${key}`, JSON.stringify(value));
    } catch {
      // The experience still works when browser storage is unavailable.
    }
  }, [key, value]);

  return [value, setValue];
}
