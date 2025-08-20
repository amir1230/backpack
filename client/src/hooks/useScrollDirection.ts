import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // If we're at the top, always show
      if (scrollTop <= 0) {
        setIsVisible(true);
        setScrollDirection('up');
        return;
      }

      // Determine scroll direction
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down and not at top
        setScrollDirection('down');
        setIsVisible(false);
      } else if (scrollTop < lastScrollTop) {
        // Scrolling up
        setScrollDirection('up');
        setIsVisible(true);
      }

      setLastScrollTop(scrollTop);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
    };
  }, [lastScrollTop]);

  return { scrollDirection, isVisible };
}