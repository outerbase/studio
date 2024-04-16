"use client";

import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  theme,
  onChange,
}: PropsWithChildren<{
  theme: ThemeType;
  onChange?: (theme: ThemeType) => void;
}>) {
  const toggleTheme = useCallback(() => {
    if (onChange) {
      const newTheme = theme === "dark" ? "light" : "dark";
      onChange(newTheme);
    }
  }, [onChange, theme]);

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
