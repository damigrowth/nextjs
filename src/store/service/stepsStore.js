const useStepsStore = (set) => ({
  step: "info",
  steps: {
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
  },
  setStep: (currentStep) => set(() => ({ step: currentStep })),
  //   setStep: (step) =>
  //     set((state) => {
  //       if (state.saved.info === false) {
  //         console.log("not saved");
  //       }
  //       return {};
  //     }),
});

export default useStepsStore;
