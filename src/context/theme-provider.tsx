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

export type ThemeType = "dark" | "light";

const ThemeContext = createContext<{
  theme: ThemeType;
  disableToggle: boolean;
  toggleTheme: (theme?: string) => void;
}>({
  theme: "dark",
  disableToggle: false,
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
  disableToggle,
}: PropsWithChildren<{ defaultTheme: ThemeType; disableToggle?: boolean }>) {
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);

  const toggleTheme = useCallback(
    (assignedTheme?: string) => {
      setTheme((prevTheme) => {
        if (assignedTheme) {
          return assignedTheme === "dark" ? "dark" : "light";
        }

        const newTheme = prevTheme === "dark" ? "light" : "dark";
        setCookie("theme", newTheme);
        return newTheme;
      });
    },
    [setTheme]
  );

  useEffect(() => {
    if (theme === "light") {
      window.document.body.classList.remove("dark");
    } else {
      window.document.body.classList.add("dark");
    }
  }, [theme]);

  const value = useMemo(
    () => ({ toggleTheme, theme, disableToggle: disableToggle ?? false }),
    [toggleTheme, theme, disableToggle]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
