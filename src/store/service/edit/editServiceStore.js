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
    // Create normalized structures for taxonomy data
    const normalizeCategory = (data) => {
      if (!data || !data.id) return { id: 0, label: "" };
      return {
        id: data.id,
        label: data.attributes?.label || "",
        data,
      };
    };

    const normalizeTags = (tags) => {
      if (!tags || !tags.data) return [];
      return tags.data.map((tag) => ({
        id: tag.id,
        label: tag.attributes?.label || "",
        data: tag,
        attributes: tag.attributes || null,
        value: tag.id,
        isNewTerm: false,
      }));
    };

    set({
      serviceId: service.id,
      status: service.status.data.attributes.type,
      info: {
        fixed: true,
        title: service.title,
        description: service.description,
        price: service.price,
        category: normalizeCategory(service.category.data),
        subcategory: normalizeCategory(service.subcategory.data),
        subdivision: normalizeCategory(service.subdivision.data),
        tags: normalizeTags(service.tags),
      },
      initialValues: {
        title: service.title,
        description: service.description,
        price: service.price,
        status: service.status.data.attributes.type,
        category: normalizeCategory(service.category.data),
        subcategory: normalizeCategory(service.subcategory.data),
        subdivision: normalizeCategory(service.subdivision.data),
        tags: normalizeTags(service.tags),
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

    // Compare status with the original status
    const statusChanged = state.status !== initialValues.status;

    // Compare basic fields
    const basicFieldsChanged =
      state.info.title !== initialValues.title ||
      state.info.description !== initialValues.description ||
      state.info.price !== initialValues.price;

    // Compare taxonomy IDs
    const categoryId = state.info.category?.id?.toString();
    const initialCategoryId = initialValues.category?.id?.toString();
    const categoryChanged = categoryId !== initialCategoryId;

    const subcategoryId = state.info.subcategory?.id?.toString();
    const initialSubcategoryId = initialValues.subcategory?.id?.toString();
    const subcategoryChanged = subcategoryId !== initialSubcategoryId;

    const subdivisionId = state.info.subdivision?.id?.toString();
    const initialSubdivisionId = initialValues.subdivision?.id?.toString();
    const subdivisionChanged = subdivisionId !== initialSubdivisionId;

    // Compare tags by ID
    const currentTagIds = state.info.tags.map((tag) => tag.id).sort();
    const initialTagIds = initialValues.tags.map((tag) => tag.id).sort();
    const tagsChanged =
      JSON.stringify(currentTagIds) !== JSON.stringify(initialTagIds);

    // Compare addons and FAQ
    const addonsChanged =
      JSON.stringify(state.addons) !== JSON.stringify(initialValues.addons);
    const faqChanged =
      JSON.stringify(state.faq) !== JSON.stringify(initialValues.faq);

    // Check media changes
    const mediaChanged =
      state.media.some((item) => item.file instanceof File) ||
      state.deletedMediaIds.length > 0;

    return (
      statusChanged ||
      basicFieldsChanged ||
      categoryChanged ||
      subcategoryChanged ||
      subdivisionChanged ||
      tagsChanged ||
      addonsChanged ||
      faqChanged ||
      mediaChanged
    );
  },
}));

export default useEditServiceStore;
