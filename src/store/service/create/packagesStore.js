const initialFeatureState = {
  title: "",
  isCheckField: false,
  checked: false,
  value: "",
};

const initialErrorsState = {
  field: "",
  message: "",
  active: false,
};

const usePackagesStore = (set, get) => ({
  packages: {
    basic: {
      tier: "basic",
      nav: {
        title: "Απλό",
        button: "Νέα Απλή παροχή",
        previous: null,
        next: {
          text: "Κανονικό",
          tier: "standard",
        },
        minPrice: 10,
      },
      id: 7,
      __component: "pricing.basic-package",
      title: "Απλό",
      description: "",
      price: 10,
      features: [],
    },
    standard: {
      tier: "standard",
      nav: {
        title: "Κανονικό",
        button: "Νέα Κανονική παροχή",
        previous: {
          text: "Απλό",
          tier: "basic",
        },
        next: {
          text: "Προχωρημένο",
          tier: "premium",
        },
        minPrice: 10,
      },
      id: 9,
      __component: "pricing.standard-package",
      title: "Κανονικό",
      description: "",
      price: 10,
      features: [],
    },
    premium: {
      tier: "premium",
      nav: {
        title: "Προχωρημένο",
        button: "Νέα Προχωρημένη παροχή",
        previous: {
          text: "Κανονικό",
          tier: "standard",
        },
        next: null,
        minPrice: 10,
      },
      id: 3,
      __component: "pricing.premium-package",
      title: "Προχωρημένο",
      description: "",
      price: 10,
      features: [],
    },
  },
  tier: "basic",
  setTier: (currentTier) => set(() => ({ tier: currentTier })),
  newFeature: initialFeatureState,
  editingFeature: initialFeatureState,
  showNewFeatureInputs: false,
  editingMode: false,
  editingInput: 0,
  errors: initialErrorsState,
  setPackageValues: (key, value) =>
    set((state) => ({
      packages: {
        ...state.packages,
        [state.tier]: {
          ...state.packages[state.tier],
          [key]: value,
        },
      },
    })),
  clearNewFeature: () =>
    set(() => ({
      newFeature: initialFeatureState,
      showNewFeatureInputs: false,
      errors: initialErrorsState,
    })),
  clearEditingFeature: () =>
    set({
      editingFeature: initialFeatureState,
      editingInput: 0,
      editingMode: false,
    }),
  handleNewFeatureChange: (key, value) =>
    set((state) => ({
      newFeature: {
        ...state.newFeature,
        [key]: value,
      },
    })),
  handleEditingFeatureChange: (key, value) =>
    set((state) => ({
      editingFeature: {
        ...state.editingFeature,
        [key]: value,
      },
    })),
  handleShowNewFeatureInputs: () =>
    set((state) => ({
      errors: initialErrorsState,
      showNewFeatureInputs: !state.showNewFeatureInputs,
    })),
  setMinPrice: (prevTier, tier) =>
    set((state) => ({
      ...state,
      packages: {
        ...state.packages,
        [tier]: {
          ...state.packages[tier],
          price: state.packages[prevTier].price + 1,
          nav: {
            ...state.packages[tier].nav,
            minPrice: state.packages[prevTier].price,
          },
        },
      },
    })),
  saveNewFeature: () =>
    set((state) => {
      const tier = state.tier;
      const tierFeatures = [...state.packages[tier].features];
      const { title, value, isCheckField } = state.newFeature;

      if (isCheckField === false) {
        // Check if the maximum number of features is reached
        if (tierFeatures.length >= 10) {
          return {
            errors: {
              field: "features",
              active: true,
              message: "Ο μέγιστος αριθμός παροχών είναι 10.",
            },
          };
        }

        // Check if the title is over 1 characters
        if (title.length < 1) {
          return {
            errors: {
              field: "package-feature-title",
              active: true,
              message: "Ο τίτλος παροχής είναι υποχρεωτικός",
            },
          };
        }

        // Check if the title is over 5 characters
        if (title.length < 5) {
          return {
            errors: {
              field: "package-feature-title",
              active: true,
              message: "Ο τίτλος παροχής είναι μικρός",
            },
          };
        }

        // Check if the value is over 1 character
        if (value.length < 1) {
          return {
            errors: {
              field: "package-feature-value",
              active: true,
              message: "To κείμενο παροχής είναι υποχρεωτικό",
            },
          };
        }
      }

      // Update features for all tiers using Object.keys
      const updatedPackages = Object.keys(state.packages).reduce(
        (updated, tier) => {
          const updatedPackage = {
            ...state.packages[tier],
            features: [...tierFeatures, state.newFeature],
          };
          return {
            ...updated,
            [tier]: updatedPackage,
          };
        },
        {}
      );

      return {
        errors: initialErrorsState,
        packages: updatedPackages,
        newFeature: initialFeatureState,
        showNewFeatureInputs: false,
      };
    }),

  deleteFeature: (index) =>
    set((state) => {
      // Create a copy of the state packages object
      const updatedPackages = { ...state.packages };

      // Iterate over each package and remove the feature at the specified index
      Object.keys(updatedPackages).forEach((tier) => {
        updatedPackages[tier].features.splice(index, 1);
      });

      return {
        ...state,
        editingInput: index,
        editingMode: false,
        packages: updatedPackages,
      };
    }),

  editFeature: (index) =>
    set((state) => ({
      ...state,
      editingMode: true,
      editingInput: index,
      editingFeature: { ...state.packages[state.tier].features[index] },
    })),

  cancelEditingFeature: () =>
    set((state) => ({
      ...state,
      editingMode: false,
      editingInput: 0,
      editingFeature: initialFeatureState,
    })),

  saveEditingFeature: () =>
    set((state) => {
      const { editingInput, editingFeature } = state;
      const { title, value, isCheckField } = editingFeature;
      if (
        editingInput >= 0 &&
        editingInput < state.packages[state.tier].features.length
      ) {
        const newPackageFeatures = [...state.packages[state.tier].features];
        newPackageFeatures[editingInput] = { ...editingFeature };

        // Check if the title is over 1 characters
        if (title.length < 1) {
          return {
            errors: {
              field: "editing-feature-title",
              active: true,
              message: "Ο τίτλος παροχής είναι υποχρεωτικός",
            },
          };
        }

        // Check if the title is over 5 characters
        if (title.length < 5) {
          return {
            errors: {
              field: "editing-feature-title",
              active: true,
              message: "Ο τίτλος παροχής είναι μικρός",
            },
          };
        }

        if (!isCheckField) {
          // Check if the value is over 1 character
          if (editingFeature.value.length < 1) {
            return {
              errors: {
                field: "editing-feature-value",
                active: true,
                message: "To κείμενο παροχής είναι υποχρεωτικό",
              },
            };
          }
        }

        //TODO Update bugged checked value

        const updatedPackages = Object.keys(state.packages).reduce(
          (updatedPackages, tier) => ({
            ...updatedPackages,
            [tier]: {
              ...state.packages[tier],
              features: state.packages[tier].features.map((feature, index) => {
                if (index === editingInput) {
                  return {
                    ...feature,
                    title: title,
                  };
                }
                return feature;
              }),
            },
          }),
          {}
        );

        // Update the features for the current tier
        updatedPackages[state.tier].features = newPackageFeatures;

        return {
          ...state,
          errors: initialErrorsState,
          packages: updatedPackages,
          editingFeature: initialFeatureState,
          editingInput: 0,
          editingMode: false,
        };
      } else {
        console.error("Invalid editing input index");
        return state;
      }
    }),
});

export default usePackagesStore;
