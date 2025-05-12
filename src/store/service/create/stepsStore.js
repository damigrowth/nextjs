const initialStep = "type";
const initialFixedStepsTypeState = {
  type: {
    previous: null,
    next: "info",
  },
  info: {
    previous: "type",
    next: "addonsFaq", // Changed
  },
  addonsFaq: {
    // New combined step
    previous: "info",
    next: "gallery",
  },
  gallery: {
    previous: "addonsFaq", // Changed
    next: null,
  },
};
const initialPackagesStepsTypeState = {
  type: {
    previous: null,
    next: "info",
  },
  info: {
    previous: "type",
    next: "packages",
  },
  packages: {
    previous: "info",
    next: "addonsFaq", // Changed
  },
  addonsFaq: {
    // New combined step
    previous: "packages",
    next: "gallery",
  },
  gallery: {
    previous: "addonsFaq", // Changed
    next: null,
  },
};

const useStepsStore = (set) => ({
  step: initialStep,
  steps: initialFixedStepsTypeState,
  setStep: (currentStep) => set(() => ({ step: currentStep })),
  handleStepsTypeChange: (fixed) =>
    set((state) => {
      if (fixed || fixed === null) {
        return {
          ...state,
          steps: initialFixedStepsTypeState,
        };
      }

      if (!fixed) {
        return {
          ...state,
          steps: initialPackagesStepsTypeState,
        };
      }
    }),
});

export default useStepsStore;
