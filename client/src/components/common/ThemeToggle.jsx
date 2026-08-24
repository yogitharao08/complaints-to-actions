import React from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ theme, onThemeChange }) {
  const nextTheme = theme === "dark" ? "light" : "dark";
  return (
    <button className="theme-toggle" onClick={() => onThemeChange(nextTheme)} type="button" aria-label={`Switch to ${nextTheme} mode`}>
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
