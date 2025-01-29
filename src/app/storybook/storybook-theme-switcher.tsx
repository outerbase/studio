"use client";

import { Button } from "@/components/ui/button";
import { LucideLightbulb, LucideMoon } from "lucide-react";
import { useEffect, useState } from "react";

export default function StorybookThemeSwitcher() {
  const [storybookTheme, setStorybookTheme] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const theme = window.localStorage.getItem("storybook-theme") || "light";
      setStorybookTheme(theme);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (storybookTheme === "dark") {
      document.body.classList.add("dark");
      localStorage.setItem("storybook-theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("storybook-theme", "light");
    }
  }, [storybookTheme]);

  return (
    <Button
      size={"icon"}
      variant={"outline"}
      onClick={() =>
        setStorybookTheme((prev) => (prev === "dark" ? "light" : "dark"))
      }
    >
      {storybookTheme === "dark" ? (
        <LucideLightbulb className="h-4 w-4" />
      ) : (
        <LucideMoon className="h-4 w-4" />
      )}
    </Button>
  );
}
