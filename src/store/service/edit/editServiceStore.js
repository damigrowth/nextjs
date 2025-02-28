import { create } from "zustand";
import useEditInfoStore from "./editInfoStore";
import useEditAddonsStore from "./editAddonsStore";
import useEditFaqStore from "./editFaqStore";
import useEditGalleryStore from "./editGalleryStore";
import useEditSaveServiceStore from "./editSaveServiceStore";

// Create a specialized EditGalleryStore to ensure deletedMediaIds is properly handled

const useEditServiceStore = create((set, get) => ({
  // Initialize deletedMediaIds at the root level like in the original

  // Include the stores needed for editing
  ...useEditInfoStore(set, get),
  // ...useTypeStore(set, get),
  // ...useEditPackagesStore(set, get),
  ...useEditAddonsStore(set, get),
  ...useEditFaqStore(set, get),
  ...useEditGalleryStore(set),
  ...useEditSaveServiceStore(set, get),

  // Edit-specific state
  serviceId: null,
  status: "",
  initialValues: {
    title: "",
    description: "",
    price: 0,
    status: "",
    addons: [],
    faq: [],
    media: [],
    category: { id: 0, label: "" },
    subcategory: { id: 0, label: "" },
    subdivision: { id: 0, label: "" },
    tags: [],
  },

  // Initialize with service data
  initializeWithService: (service) => {
    set({
      serviceId: service.id,
      status: service.status.data.attributes.type,
      info: {
        fixed: true,
        title: service.title,
        description: service.description,
        price: service.price,
        category: service.category.data,
        subcategory: service.subcategory.data,
        subdivision: service.subdivision.data,
        tags: service.tags?.data || [],
      },
      initialValues: {
        title: service.title,
        description: service.description,
        price: service.price,
        status: service.status.data.attributes.type,
        category: service.category.data,
        subcategory: service.subcategory.data,
        subdivision: service.subdivision.data,
        tags: service.tags?.data || [],
      },
    });

    // Initialize addons if they exist
    if (service.addons) {
      set({
        addons: service.addons,
        initialValues: {
          ...get().initialValues,
          addons: service.addons,
        },
      });
    }

    // Initialize FAQ if it exists
    if (service.faq) {
      set({
        faq: service.faq,
        initialValues: {
          ...get().initialValues,
          faq: service.faq,
        },
      });
    }

    // Handle media separately
    if (service.media?.data) {
      const formattedMedia = service.media.data.map((mediaItem) => ({
        file: mediaItem,
        url: mediaItem.attributes.url,
      }));

      set({
        gallery: service.media,
        media: formattedMedia,
        deletedMediaIds: [],
        initialValues: {
          ...get().initialValues,
          media: formattedMedia,
        },
      });
    }
  },

  // Update status
  setStatus: (newStatus) => set({ status: newStatus }),

  // Check for changes
  hasChanges: () => {
    const state = get();
    const initialValues = state.initialValues;

    return (
      state.status !== initialValues.status ||
      state.info.title !== initialValues.title ||
      state.info.description !== initialValues.description ||
      state.info.price !== initialValues.price ||
      state.info.category?.id !== initialValues.category?.id ||
      state.info.subcategory?.id !== initialValues.subcategory?.id ||
      state.info.subdivision?.id !== initialValues.subdivision?.id ||
      JSON.stringify(state.info.tags) !== JSON.stringify(initialValues.tags) ||
      JSON.stringify(state.addons) !== JSON.stringify(initialValues.addons) ||
      JSON.stringify(state.faq) !== JSON.stringify(initialValues.faq) ||
      state.media.some((item) => item.file instanceof File) ||
      state.deletedMediaIds.length > 0
    );
  },
}));

export default useEditServiceStore;
