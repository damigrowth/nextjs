// Initial component state for packages
const packageComponent = "__component";

const initialPackageState = {
  id: 0,
  [packageComponent]: "service.package",
  title: "",
  description: "",
  price: 10,
  features: [],
};

const useEditPackagesStore = (set) => ({
  packages: {
    basic: { ...initialPackageState, title: "Basic" },
    standard: { ...initialPackageState, title: "Standard" },
    premium: { ...initialPackageState, title: "Premium" },
  },
  selectedTier: "basic",
  packageFeatureText: "",
  setSelectedTier: (tier) => set(() => ({ selectedTier: tier })),
  setPackageFeatureText: (text) => set(() => ({ packageFeatureText: text })),
  setPackageValue: (tier, key, value) =>
    set((state) => ({
      packages: {
        ...state.packages,
        [tier]: {
          ...state.packages[tier],
          [key]: value,
        },
      },
    })),
  addPackageFeature: (tier, feature) =>
    set((state) => ({
      packageFeatureText: "",
      packages: {
        ...state.packages,
        [tier]: {
          ...state.packages[tier],
          features: [
            ...state.packages[tier].features,
            {
              id: Date.now(),
              text: feature,
            },
          ],
        },
      },
    })),
  removePackageFeature: (tier, featureId) =>
    set((state) => ({
      packages: {
        ...state.packages,
        [tier]: {
          ...state.packages[tier],
          features: state.packages[tier].features.filter(
            (feature) => feature.id !== featureId
          ),
        },
      },
    })),
  updatePackageTiers: (tiers) =>
    set((state) => {
      const updatedPackages = { ...state.packages };
      
      // Update each tier with the new data
      tiers.forEach((tierData, index) => {
        const tierKey = ['basic', 'standard', 'premium'][index];
        if (tierKey && updatedPackages[tierKey]) {
          updatedPackages[tierKey] = {
            ...updatedPackages[tierKey],
            ...tierData
          };
        }
      });
      
      return { packages: updatedPackages };
    }),
});

export default useEditPackagesStore;
