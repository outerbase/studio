"use client";
import { Gear, Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ButtonGroup, ButtonGroupItem } from "./button-group";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // This is to prevent mismatched render on the server
  // This is just a placeholder to avoid flicking as well
  // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#avoid-hydration-mismatch
  if (!mounted)
    return (
      <ButtonGroup>
        <ButtonGroupItem>
          <Gear weight="fill" className="mr-1 h-4 w-4" />
          System
        </ButtonGroupItem>
        <ButtonGroupItem>
          <Moon weight="fill" className="mr-1 h-4 w-4" />
          Dark
        </ButtonGroupItem>
        <ButtonGroupItem>
          <Sun weight="fill" className="mr-1 h-4 w-4" />
          Light
        </ButtonGroupItem>
      </ButtonGroup>
    );

  return (
    <ButtonGroup>
      <ButtonGroupItem
        onClick={() => setTheme("system")}
        selected={theme === "system"}
      >
        <Gear weight="fill" className="mr-1 h-4 w-4" />
        System
      </ButtonGroupItem>
      <ButtonGroupItem
        onClick={() => setTheme("dark")}
        selected={theme === "dark"}
      >
        <Moon weight="fill" className="mr-1 h-4 w-4" />
        Dark
      </ButtonGroupItem>
      <ButtonGroupItem
        onClick={() => setTheme("light")}
        selected={theme === "light"}
      >
        <Sun weight="fill" className="mr-1 h-4 w-4" />
        Light
      </ButtonGroupItem>
    </ButtonGroup>
  );
}
