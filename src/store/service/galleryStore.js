const useGalleryStore = (set) => ({
  gallery: [],
  media: [],
  loading: false,
  setLoading: (payload) => set(() => ({ loading: payload })),
  setMedia: (newFiles) =>
    set((state) => ({
      media: [
        ...state.media,
        ...newFiles.filter(
          (item) => !state.media.some((f) => f.file.name === item.file.name)
        ),
      ],
    })),
  mediaDelete: (fileName) => {
    set((state) => ({
      media: state.media.filter((item) => item.file.name !== fileName),
    }));
  },
  setGallery: (urls) => set(() => ({ gallery: urls })),
});

export default useGalleryStore;
