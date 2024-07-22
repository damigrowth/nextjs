import { create } from "zustand";

const useArchiveStore = create((set) => ({
  bannerVideoToggled: false,
  bannerVideoHandler: () =>
    set((state) => ({ bannerVideoToggled: !state.bannerVideoToggled })),
}));

export default useArchiveStore;
