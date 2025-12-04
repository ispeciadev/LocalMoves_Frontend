import { create } from "zustand";

export const useSidebarStore = create((set) => ({
  openSidebar: null, // can be 'logistic', 'navbar', or null
  setOpenSidebar: (sidebar) => set({ openSidebar: sidebar }),
}));
