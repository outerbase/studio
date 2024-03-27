"use client";
import { setCookie } from "cookies-next";
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

export default function ThemeProvider({
  children,
  defaultTheme,
}: PropsWithChildren<{ defaultTheme: ThemeType }>) {
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setCookie("theme", newTheme);
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
