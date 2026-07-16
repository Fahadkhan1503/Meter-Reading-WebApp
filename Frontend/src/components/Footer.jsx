import React, { useEffect, useState } from 'react';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const nearBottom = scrollTop + windowHeight >= documentHeight - 40;

      setIsVisible(nearBottom);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-10 border-t border-line bg-paper py-3 px-2 text-center text-[11px] sm:text-sm text-ink-soft shadow-sm transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <span className="text-gray-400 block sm:inline">© 2026 MeterClick. Built by <a
          href="https://github.com/Fahadkhan1503"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline transition"
        >
          Muhammad Fahad
        </a></span>
    </footer>
  );
};

export default Footer;