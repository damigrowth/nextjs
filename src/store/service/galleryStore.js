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
          (file) => !state.media.some((f) => f.name === file.name)
        ),
      ],
    })),
  mediaDelete: (fileName) => {
    set((state) => ({
      media: state.media.filter((file) => file.name !== fileName),
    }));
  },
  setGallery: (urls) => set(() => ({ gallery: urls })),
});

export default useGalleryStore;
