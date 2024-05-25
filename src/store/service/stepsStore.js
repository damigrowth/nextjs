const initialStep = "info";
const initialFixedStepsTypeState = {
  info: {
    previous: null,
    next: "addons",
  },
  addons: {
    previous: "info",
    next: "faq",
  },
  faq: {
    previous: "addons",
    next: "gallery",
  },
  gallery: {
    previous: "faq",
    next: null,
  },
};
const initialPackagesStepsTypeState = {
  info: {
    previous: null,
    next: "packages",
  },
  packages: {
    previous: "info",
    next: "addons",
  },
  addons: {
    previous: "packages",
    next: "faq",
  },
  faq: {
    previous: "addons",
    next: "gallery",
  },
  gallery: {
    previous: "faq",
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
