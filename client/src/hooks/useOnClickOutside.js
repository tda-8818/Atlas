export function useOnClickOutside(ref, handler) {
    useEffect(() => {
      const listener = (event) => {
        // If clicking inside the ref, do nothing
        if (!ref.current || ref.current.contains(event.target)) return;
        handler(event);
      };
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);
      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    }, [ref, handler]);
  }