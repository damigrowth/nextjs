import { create } from 'zustand';

const useArchiveStore = create((set) => ({
  bannerVideoToggled: false,
  bannerVideoHandler: () =>
    set((state) => ({ bannerVideoToggled: !state.bannerVideoToggled })),
  filtersModalToggled: false,
  filtersModalHandler: () =>
    set((state) => ({
      filtersModalToggled: !state.filtersModalToggled,
    })),
}));

export default useArchiveStore;
