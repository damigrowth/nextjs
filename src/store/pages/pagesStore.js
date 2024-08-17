import { create } from "zustand";

const usePagesStore = create((set) => ({
  tab: "",
  setTab: (currentTab) => set(() => ({ tab: currentTab })),
}));

export default usePagesStore;
