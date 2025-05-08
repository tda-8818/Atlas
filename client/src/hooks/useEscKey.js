import { useEffect } from 'react';

export function useEscKey(handler) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handler(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handler]);
}