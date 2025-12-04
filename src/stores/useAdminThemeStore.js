// src/stores/useAdminThemeStore.js
import { create } from "zustand";

/**
 * Admin Theme Store (Zustand)
 * - manages dark mode for admin panel only
 * - persists to localStorage
 */

export const useAdminThemeStore = create((set) => ({
  isDarkMode: (() => {
    try {
      const stored = localStorage.getItem("adminDarkMode");
      if (stored === null) {
        return (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        );
      }
      return JSON.parse(stored);
    } catch {
      return false;
    }
  })(),

  toggleDarkMode: () => {
    set((state) => {
      const newValue = !state.isDarkMode;
      try {
        localStorage.setItem("adminDarkMode", JSON.stringify(newValue));
      } catch {
        console.error("Failed to save dark mode preference");
      }
      return { isDarkMode: newValue };
    });
  },

  setDarkMode: (isDark) => {
    set(() => {
      try {
        localStorage.setItem("adminDarkMode", JSON.stringify(isDark));
      } catch {
        console.error("Failed to save dark mode preference");
      }
      return { isDarkMode: isDark };
    });
  },
}));
