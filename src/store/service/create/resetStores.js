const resetStores = (set) => ({
  resetAll: () => {
    set((state) => {
      return {
        // Reset to initial step
        step: "type",
        // Reset type information
        typeStep: 0,
        type: {
          online: null,
          presence: null,
          oneoff: null,
          subscription: null,
          onsite: null,
          onbase: null,
        },
        // Reset service information
        info: {
          fixed: true,
          title: "",
          description: "",
          price: 10,
          subscription_type: "month",
          time: 1,
          category: { id: 0, label: "" },
          subcategory: { id: 0, label: "" },
          subdivision: { id: 0, label: "" },
          tags: [],
        },
        // Reset addons and FAQs
        addons: [],
        faq: [],
        // Reset gallery
        gallery: [],
        media: [],
        // Reset service data
        service: {},
        // Reset validation states
        errors: {
          field: "",
          message: "",
          active: false,
        },
        saved: {
          type: false,
          info: false,
          packages: false,
          addons: false,
          faq: false,
          gallery: false,
        },
        // Reset packages to default state
        packages: {
          basic: {
            ...state.packages.basic,
            description: "",
            price: 10,
            features: [],
          },
          standard: {
            ...state.packages.standard,
            description: "",
            price: 10,
            features: [],
          },
          premium: {
            ...state.packages.premium,
            description: "",
            price: 10,
            features: [],
          },
        },
      };
    });
  },
});

export default resetStores;
