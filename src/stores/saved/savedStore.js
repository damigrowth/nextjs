import { create } from 'zustand';

const useSavedStore = create((set, get) => ({
  currentTab: 0,
  setCurrentTab: (tab) => set({ currentTab: tab }),
}));

export default useSavedStore;
