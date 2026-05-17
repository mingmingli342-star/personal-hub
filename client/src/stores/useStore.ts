import { create } from "zustand";

interface AppStore {
  darkMode: boolean;
  toggleDarkMode: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", prefersDark);

export const useStore = create<AppStore>((set) => ({
  darkMode: prefersDark,
  toggleDarkMode: () => set((s) => {
    const next = !s.darkMode;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    return { darkMode: next };
  }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
}));
