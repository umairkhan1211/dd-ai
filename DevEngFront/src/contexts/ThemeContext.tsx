import React, { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark" | "pink" | "blue";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

// Custom hook for using the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if theme is saved in localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      return savedTheme || "dark";
    }
    return "dark";
  });

  // Apply theme class to document body
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Remove all theme classes
    document.body.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-pink",
      "theme-blue"
    );

    // Add new theme class
    document.body.classList.add(`theme-${theme}`);

    // Update document data attribute for tailwind dark mode
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = { theme, setTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
