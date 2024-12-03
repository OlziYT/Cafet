import { create } from 'zustand';

interface MenuStore {
  resetView: () => void;
  setResetView: (callback: () => void) => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  resetView: () => {},
  setResetView: (callback: () => void) => set({ resetView: callback }),
}));
