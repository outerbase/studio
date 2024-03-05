"use client";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeType = "dark" | "light";

const ThemeContext = createContext<{
  theme: ThemeType;
  toggleTheme: (theme?: string) => void;
}>({
  theme: "dark",
  toggleTheme: () => {
    throw new Error("Not implemented");
  },
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeType>(
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  }, [setTheme, theme]);

  useEffect(() => {
    if (theme === "light") {
      window.document.body.classList.remove("dark");
    } else {
      window.document.body.classList.add("dark");
    }
  }, [theme]);

  const value = useMemo(() => ({ toggleTheme, theme }), [toggleTheme, theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
