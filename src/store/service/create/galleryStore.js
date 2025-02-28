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
  mediaDelete: (idOrName) => {
    set((state) => {
      // If it's a Strapi media (has ID), add it to deletedMediaIds
      if (typeof idOrName === "string" && idOrName.match(/^\d+$/)) {
        return {
          deletedMediaIds: [...state.deletedMediaIds, idOrName],
          media: state.media.filter((item) => {
            if (item.file.attributes) {
              return item.file.id !== idOrName;
            }
            return item.file.name !== idOrName;
          }),
        };
      }

      // For new uploads, just remove from media array
      return {
        media: state.media.filter((item) => item.file.name !== idOrName),
      };
    });
  },
  setGallery: (urls) => set(() => ({ gallery: urls })),
  clearDeletedMediaIds: () => set(() => ({ deletedMediaIds: [] })),
});

export default useGalleryStore;
