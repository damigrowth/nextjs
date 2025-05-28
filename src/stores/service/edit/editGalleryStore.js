const useEditGalleryStore = (set) => ({
  gallery: [],
  media: [],
  deletedMediaIds: [],
  loading: false,
  setLoading: (payload) => set(() => ({ loading: payload })),
  setMedia: (newFiles) =>
    set((state) => {
      // Filter out duplicates
      const filteredNewFiles = newFiles.filter(
        (item) => !state.media.some((f) => f.file.name === item.file.name),
      );

      return {
        media: [...state.media, ...filteredNewFiles],
      };
    }),
  mediaDelete: (idOrName) => {
    set((state) => {
      // If it's a Strapi media (has ID), add it to deletedMediaIds
      if (typeof idOrName === 'string' && idOrName.match(/^\d+$/)) {
        // Add to deletedMediaIds array and remove from media array
        const newDeletedIds = [...(state.deletedMediaIds || []), idOrName];

        const updatedMedia = state.media.filter((item) => {
          if (item.file.attributes) {
            return item.file.id !== idOrName;
          }

          return item.file.name !== idOrName;
        });

        return {
          deletedMediaIds: newDeletedIds,
          media: updatedMedia,
        };
      }

      // For new uploads, just remove from media array
      const updatedMedia = state.media.filter(
        (item) => item.file.name !== idOrName,
      );

      return {
        media: updatedMedia,
      };
    });
  },
  setGallery: (urls) => set(() => ({ gallery: urls })),
  clearDeletedMediaIds: () => set(() => ({ deletedMediaIds: [] })),
});

export default useEditGalleryStore;
