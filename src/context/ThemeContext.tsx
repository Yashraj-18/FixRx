import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  primaryText: string;
  secondaryText: string;
  text: string;
  border: string;
  inputBackground: string;
  cardBackground: string;
  card: string;
  headerBackground: string;
  tabBarBackground: string;
  tabBarBorder: string;
  success: string;
  warning: string;
  error: string;
  notification: string;
  info: string;
}

interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    primary: '#007AFF',
    secondary: '#8E8E93',
    primaryText: '#000000',
    secondaryText: '#8E8E93',
    text: '#000000',
    border: '#C6C6C8',
    inputBackground: '#FFFFFF',
    cardBackground: '#FFFFFF',
    card: '#FFFFFF',
    headerBackground: '#F2F2F7',
    tabBarBackground: '#F2F2F7',
    tabBarBorder: '#C6C6C8',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    notification: '#FF3B30',
    info: '#007AFF',
  },
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    primary: '#3B82F6',
    secondary: '#94A3B8',
    primaryText: '#F1F5F9',
    secondaryText: '#94A3B8',
    text: '#F1F5F9',
    border: '#334155',
    inputBackground: '#1E293B',
    cardBackground: '#1E293B',
    card: '#1E293B',
    headerBackground: '#0F172A',
    tabBarBackground: '#0F172A',
    tabBarBorder: '#334155',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    notification: '#EF4444',
    info: '#3B82F6',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        isDarkMode, 
        toggleTheme,
        colors: theme.colors 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
