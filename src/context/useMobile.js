import { useState, useEffect } from 'react';

const SM_BREAKPOINT = 640; // Standard 'sm' breakpoint in pixels

export function useMobile(breakpoint = SM_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    // Set the initial value on mount
    setIsMobile(mediaQuery.matches);

    // Update state when the screen crosses the breakpoint
    const handleChange = (event) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return isMobile;
}
