import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../hooks/useTheme';

function ThemeSwitcherPortal() {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const currentTheme = themes.find(t => t.name === theme) || themes[2];

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 5,
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      updateDropdownPosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleThemeChange = (e, themeName) => {
    e.stopPropagation();
    console.log('Changing theme to:', themeName);
    setTheme(themeName);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    function handleScroll() {
      if (isOpen) {
        updateDropdownPosition();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateDropdownPosition);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/20"
      >
        <span className="text-lg">{currentTheme.icon}</span>
        <span className="hidden sm:inline">Theme</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] w-56 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
          style={{
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
          }}
        >
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              Choose Theme
            </div>
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={(e) => handleThemeChange(e, t.name)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  theme === t.name
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="flex-1 text-left">{t.label}</span>
                {theme === t.name && (
                  <span className="text-amber-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default ThemeSwitcherPortal;