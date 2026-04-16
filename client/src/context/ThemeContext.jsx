import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
export { ThemeContext };

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('library-theme');
    return savedTheme || 'emerald';
  });

  useEffect(() => {
    console.log('ThemeProvider - Theme changed to:', theme);
    // Apply theme to html element
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('library-theme', theme);
  }, [theme]);

  const themes = [
    { name: 'light', icon: '☀️', label: 'Light', gradient: 'from-gray-100 to-gray-300' },
    { name: 'dark', icon: '🌙', label: 'Dark', gradient: 'from-gray-800 to-gray-900' },
    { name: 'emerald', icon: '💚', label: 'Emerald', gradient: 'from-emerald-900 to-teal-800' },
    { name: 'forest', icon: '🌲', label: 'Forest', gradient: 'from-green-900 to-emerald-800' },
    { name: 'ocean', icon: '🌊', label: 'Ocean', gradient: 'from-blue-900 to-cyan-800' },
    { name: 'sunset', icon: '🌅', label: 'Sunset', gradient: 'from-orange-900 to-rose-800' },
    { name: 'purple', icon: '💜', label: 'Purple', gradient: 'from-purple-900 to-fuchsia-800' },
  ];

  const handleSetTheme = (newTheme) => {
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}