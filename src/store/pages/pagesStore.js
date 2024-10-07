import { create } from "zustand";

const usePagesStore = create((set) => ({
  tab: 0,
  setTab: (currentTab) => set(() => ({ tab: currentTab })),
}));

export default usePagesStore;
