"use client";

import { useTheme } from "@/components/providers";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`rounded-lg p-2 transition-colors ${
        theme === "dark"
          ? "text-yellow-300 hover:bg-gray-700 hover:text-yellow-200"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      } ${className}`}
      aria-label={theme === "dark" ? "Modo claro" : "Modo oscuro"}
      title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
