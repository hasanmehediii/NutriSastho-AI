"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.setAttribute("data-theme", theme);
}

function readStoredTheme(): Theme {
  const stored = localStorage.getItem("sb-theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const initialized = useRef(false);

  // Read stored theme and apply it BEFORE the browser paints.
  // On first mount we read from localStorage and apply immediately,
  // skipping the default "light" application. On subsequent theme
  // changes, we apply the new value normally.
  useIsomorphicLayoutEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const stored = readStoredTheme();
      applyTheme(stored);
      setThemeState(stored);
      return;
    }
    applyTheme(theme);
  }, [theme]);

  // Persist theme to localStorage whenever it changes
  useEffect(() => {
    if (initialized.current) {
      localStorage.setItem("sb-theme", theme);
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) =>
      currentTheme === "light" ? "dark" : "light",
    );
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
