const initialErrorsState = {
  field: "",
  message: "",
  active: false,
  tier: "",
};

const tiers = ["basic", "standard", "premium"];

const useSaveServiceStore = (set) => ({
  errors: initialErrorsState,
  service: {},
  optional: {
    type: false,
    info: false,
    packages: false,
    addons: true,
    faq: true,
    gallery: true,
  },
  saved: {
    type: false,
    info: false,
    packages: false,
    addons: false,
    faq: false,
    gallery: false,
  },
  saveType: () =>
    set((state) => {
      const typeStep = state.typeStep;

      // Check if the type steps are done
      if (typeStep !== 2) {
        return {
          errors: {
            field: "service-type",
            active: true,
            message: "Ο τύπος της υπηρεσίας είναι υποχρεωτικός",
          },
        };
      }

      return {
        ...state,
        errors: initialErrorsState,
        service: {
          ...state.service,
          type: state.type,
        },
        saved: {
          ...state.saved,
          type: true,
        },
      };
    }),
  saveInfo: () =>
    set((state) => {
      const {
        title,
        description,
        category,
        subcategory,
        subdivision,
        // tags,
        price,
        time,
        county,
        area,
        zipcode,
        fixed,
      } = state.info;

      const { oneoff } = state.type;

      // Check if the title is over 1 characters
      if (title.length < 1) {
        return {
          errors: {
            field: "service-title",
            active: true,
            message: "Ο τίτλος υπηρεσίας είναι υποχρεωτικός",
          },
        };
      }

      // Check if the title is over 5 characters
      if (title.length < 10) {
        return {
          errors: {
            field: "service-title",
            active: true,
            message: "Ο τίτλος υπηρεσίας είναι μικρός",
          },
        };
      }

      // Check if the description is over 1 characters
      if (description.length < 1) {
        return {
          errors: {
            field: "service-description",
            active: true,
            message: "Η περιγραφή υπηρεσίας είναι υποχρεωτική",
          },
        };
      }

      // Check if the description is over 20 characters
      if (description.length < 80) {
        return {
          errors: {
            field: "service-description",
            active: true,
            message: "Η περιγραφή υπηρεσίας είναι μικρή",
          },
        };
      }

      if (fixed === true) {
        // Check if the price is bellow 10€
        if (price < 10) {
          return {
            errors: {
              field: "service-price",
              active: true,
              message: "Η αμοιβή είναι μικρότερη από 10€",
            },
          };
        }

        // Check if the price is above 50000€
        if (price > 50000) {
          return {
            errors: {
              field: "service-price",
              active: true,
              message: "Η αμοιβή είναι μεγαλύτερη από 50000€",
            },
          };
        }
      }

      if (oneoff === true) {
        // Check if the time is bellow 1
        if (time < 1) {
          return {
            errors: {
              field: "service-time",
              active: true,
              message: "Ο χρόνος παράδωσης είναι μικρότερος από 1 μέρα",
            },
          };
        }
      }

      // Check if category is empty
      if (category.id === 0) {
        return {
          errors: {
            field: "service-category",
            active: true,
            message: "Η κατηγορία είναι υποχρεωτική",
          },
        };
      }

      // Check if subcategory is empty
      if (subcategory.id === 0) {
        return {
          errors: {
            field: "service-subcategory",
            active: true,
            message: "Η υποκατηγορία είναι υποχρεωτική",
          },
        };
      }

      // Check if subdivision is empty
      if (subdivision.id === 0) {
        return {
          errors: {
            field: "service-subdivision",
            active: true,
            message: "Το αντικείμενο είναι υποχρεωτικό",
          },
        };
      }

      // // Check if tags are empty
      // if (tags.length < 1) {
      //   return {
      //     errors: {
      //       field: "service-tags",
      //       active: true,
      //       message: "Τα χαρακτηριστικά είναι υποχρεωτικά",
      //     },
      //   };
      // }

      return {
        ...state,
        errors: initialErrorsState,
        service: {
          ...state.service,
          ...state.info,
        },
        saved: {
          ...state.saved,
          info: true,
        },
      };
    }),
  savePackages: () =>
    set((state) => {
      const { packages } = state;
      const { fixed } = state.info;

      if (fixed === false) {
        if (packages["basic"].features.length < 4) {
          return {
            errors: {
              tier: "basic",
              field: "service-packages",
              active: true,
              message: "Ο ελάχιστος αριθμός παροχών είναι 4",
            },
          };
        }

        if (packages["basic"].description.length < 1) {
          return {
            errors: {
              tier: "basic",
              field: "package-description-basic",
              active: true,
              message: "Η περιγραφή του Βασικού πακέτου είναι υποχρεωτική",
            },
          };
        }

        if (packages["standard"].description.length < 1) {
          return {
            errors: {
              tier: "standard",
              field: "package-description-standard",
              active: true,
              message: "Η περιγραφή του Κανονικού πακέτου είναι υποχρεωτική",
            },
          };
        }

        if (packages["premium"].description.length < 1) {
          return {
            errors: {
              tier: "premium",
              field: "package-description-premium",
              active: true,
              message: "Η περιγραφή του Προχωρημένου πακέτου είναι υποχρεωτική",
            },
          };
        }

        if (packages["basic"].description.length < 10) {
          return {
            errors: {
              tier: "basic",
              field: "package-description-basic",
              active: true,
              message: "Η περιγραφή του Βασικού πακέτου είναι μικρή",
            },
          };
        }

        if (packages["standard"].description.length < 10) {
          return {
            errors: {
              tier: "standard",
              field: "package-description-standard",
              active: true,
              message: "Η περιγραφή του Κανονικού πακέτου είναι μικρή",
            },
          };
        }

        if (packages["premium"].description.length < 10) {
          return {
            errors: {
              tier: "premium",
              field: "package-description-premium",
              active: true,
              message: "Η περιγραφή του Προχωρημένου πακέτου είναι μικρή",
            },
          };
        }

        if (packages["basic"].description.length >= 85) {
          return {
            errors: {
              tier: "basic",
              field: "package-description-basic",
              active: true,
              message:
                "Η μέγιστη περιγραφή του Απλού πακέτου είναι 85 χαρακτήρες",
            },
          };
        }

        if (packages["standard"].description.length >= 85) {
          return {
            errors: {
              tier: "standard",
              field: "package-description-standard",
              active: true,
              message:
                "Η μέγιστη περιγραφή του Κανονικού πακέτου είναι 85 χαρακτήρες",
            },
          };
        }

        if (packages["premium"].description.length >= 85) {
          return {
            errors: {
              tier: "premium",
              field: "package-description-premium",
              active: true,
              message:
                "Η μέγιστη περιγραφή του Προχωρημένου πακέτου είναι 85 χαρακτήρες",
            },
          };
        }

        if (packages["standard"].price <= packages["basic"].price) {
          return {
            errors: {
              tier: "standard",
              field: "package-price",
              active: true,
              message:
                "Η τιμή του κανονικού πακέτου δεν μπορεί να έιναι μικρότερη ή ίση με του βασικού",
            },
          };
        }

        if (packages["premium"].price <= packages["standard"].price) {
          return {
            errors: {
              tier: "premium",
              field: "package-price",
              active: true,
              message:
                "Η τιμή του προχωρημένου πακέτου δεν μπορεί να έιναι μικρότερη ή ίση με του κανονικού",
            },
          };
        }

        if (packages["premium"].price < packages["basic"].price) {
          return {
            errors: {
              tier: "premium",
              field: "package-price",
              active: true,
              message:
                "Η τιμή του προχωρημένου πακέτου δεν μπορεί να έιναι μικρότερη ή ίση με του βασικού",
            },
          };
        }
      }

      return {
        ...state,
        errors: initialErrorsState,
        service: {
          ...state.service,
          packages: tiers.map((tier) => ({
            id: packages[tier].id,
            __component: packages[tier].__component,
            title: packages[tier].title,
            description: packages[tier].description,
            price: packages[tier].price,
            features: packages[tier].features,
          })),
        },
        saved: {
          ...state.saved,
          packages: true,
        },
      };
    }),
  saveAddons: () =>
    set((state) => ({
      ...state,
      service: {
        ...state.service,
        addons: state.addons,
      },
      saved: {
        ...state.saved,
        addons: true,
      },
    })),
  saveFaq: () =>
    set((state) => ({
      ...state,
      service: {
        ...state.service,
        faq: state.faq,
      },
      saved: {
        ...state.saved,
        faq: true,
      },
    })),
  saveGallery: () =>
    set((state) => ({
      ...state,
      // gallery: state.media.map((item) => ({
      //   url: item.url,
      //   name: item.file.name,
      //   type: item.file.type,
      //   size: item.file.size,
      // })),
      // TODO Do the validation of the media here!
      saved: {
        ...state.saved,
        gallery: true,
      },
    })),
});

export default useSaveServiceStore;
