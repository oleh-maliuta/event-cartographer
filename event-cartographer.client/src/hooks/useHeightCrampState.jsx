import { useState, useEffect } from 'react';

/**
 * A custom hook to determine if an element is cramped based on its height and the window height.
 * @param {import('react').RefObject<HTMLElement>} ref - A React ref to the element being measured
 * @returns {boolean} true if the element is cramped, false otherwise
 */
export const useHeightCrampState = (ref) => {
  const [isCramped, setIsCramped] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        const windowHeight = window.innerHeight;
        const elementHeight = ref.current.offsetHeight;
        
        setIsCramped(windowHeight <= elementHeight);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (ref.current) resizeObserver.observe(ref.current);

    window.addEventListener('resize', handleResize);
    
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [ref]);

  return isCramped;
};
