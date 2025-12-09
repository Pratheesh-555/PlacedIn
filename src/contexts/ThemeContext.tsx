import React, { createContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [userToggled, setUserToggled] = useState<boolean>(false);

  // Always start with system theme
  const [theme, setTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Listen for system theme changes if user hasn't toggled in current session
  useEffect(() => {
    if (userToggled) return;
    
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(media.matches ? 'dark' : 'light');
    
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [userToggled]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    setUserToggled(true);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
export { ThemeProvider };
