import { create } from 'zustand';

/**
 * @typedef {import('@/lib/types').StrapiMedia} StrapiMedia
 * @typedef {import('@/lib/types').StrapiMediaItem} StrapiMediaItem
 */

// Initialize coverage in a way that handles null values gracefully (same as profile store)
const getInitialCoverage = () => {
  try {
    return {
      online: false,
      onbase: false,
      onsite: false,
      address: '',
      area: { data: null }, // Fixed order to match profile store
      county: { data: null },
      zipcode: { data: null },
      counties: { data: [] },
      areas: { data: [] },
    };
  } catch (error) {
    console.error('Error initializing coverage:', error);
    return null;
  }
};

const initialCoverage = getInitialCoverage();

const useOnboardingStore = create((set) => ({
  // Image (matches profile store exactly)
  image: { data: null },
  setImage: (value) => set(() => ({ image: value })),

  // Category (matches profile store exactly)
  category: { data: null },
  setCategory: (value) => set(() => ({ category: value })),

  // Subcategory (matches profile store exactly)
  subcategory: { data: null },
  setSubcategory: (value) => set(() => ({ subcategory: value })),

  // Description (matches profile store exactly)
  description: '',
  setDescription: (value) => set(() => ({ description: value })),

  // Coverage (matches profile store exactly)
  coverage: initialCoverage,
  setCoverage: (field, value) =>
    set((state) => {
      // If coverage is null, initialize it first
      if (state.coverage === null) {
        return {
          coverage: {
            ...initialCoverage,
            [field]: value,
          },
        };
      }
      return {
        coverage: {
          ...state.coverage,
          [field]: value,
        },
      };
    }),

  // Single method to handle all coverage mode switches (same as profile store but without freelancerCoverage parameter for onboarding)
  switchCoverageMode: (mode) =>
    set((state) => {
      // If coverage is null, initialize it first
      if (state.coverage === null) {
        return {
          coverage: {
            ...initialCoverage,
            [mode]: true,
          },
        };
      }

      const newValue = !state.coverage[mode];
      const newCoverage = { ...state.coverage };

      // Toggle the selected mode without affecting others
      newCoverage[mode] = newValue;

      // Reset fields for the specific mode if it's being disabled (same logic as profile store)
      if (!newValue) {
        if (mode === 'onbase') {
          newCoverage.address = initialCoverage.address;
          newCoverage.area = initialCoverage.area;
          newCoverage.county = initialCoverage.county;
          newCoverage.zipcode = initialCoverage.zipcode;
        } else if (mode === 'onsite') {
          newCoverage.areas = initialCoverage.areas;
          newCoverage.counties = initialCoverage.counties;
        }
      }

      return { coverage: newCoverage };
    }),

  // Portfolio (matches profile store exactly)
  portfolio: { data: [] },
  setPortfolio: (value) => set(() => ({ portfolio: value })),

  // Reset function (matches profile store pattern)
  resetOnboarding: () =>
    set({
      image: { data: null },
      category: { data: null },
      subcategory: { data: null },
      description: '',
      coverage: initialCoverage,
      portfolio: { data: [] },
    }),
}));

export default useOnboardingStore;
