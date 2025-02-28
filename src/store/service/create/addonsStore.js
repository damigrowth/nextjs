import { create } from "zustand";

const initialAddonState = {
  title: "",
  description: "",
  price: 0,
};

const initialErrorsState = {
  field: "",
  message: "",
  active: false,
};

const useAddonsStore = (set, get) => ({
  addons: [],
  newAddon: initialAddonState,
  editingAddon: initialAddonState,
  showNewAddonInputs: false,
  addonEditingMode: false,
  addonEditingInput: 0,
  errors: initialErrorsState,
  setNewAddon: (key, value) =>
    set((state) => ({
      newAddon: {
        ...state.newAddon,
        [key]: value,
      },
    })),
  setEditingAddon: (key, value) =>
    set((state) => ({
      editingAddon: {
        ...state.editingAddon,
        [key]: value,
      },
    })),

  editAddon: (index) =>
    set((state) => ({
      ...state,
      addonEditingMode: true,
      addonEditingInput: index,
      editingAddon: { ...state.addons[index] },
    })),

  handleShowNewAddonInputs: () =>
    set((state) => ({
      errors: initialErrorsState,
      showNewAddonInputs: !state.showNewAddonInputs,
    })),
  clearNewAddon: () =>
    set(() => ({
      newAddon: initialAddonState,
      showNewAddonInputs: false,
      errors: initialErrorsState,
    })),
  saveNewAddon: () =>
    set((state) => {
      const { newAddon, addons } = state;

      if (addons.length >= 3) {
        return {
          errors: {
            field: "addons",
            active: true,
            message: "Ο μέγιστος αριθμός πρόσθετων είναι 3.",
          },
        };
      }

      // Validation checks
      if (newAddon.title.length === 0) {
        return {
          errors: {
            field: "addon-title",
            message: "Ο τίτλος πρόσθετου είναι υποχρεωτικός",
            active: true,
          },
        };
      }

      if (newAddon.title.length <= 5) {
        return {
          errors: {
            field: "addon-title",
            message: "Ο τίτλος πρόσθετου είναι μικρός",
            active: true,
          },
        };
      }

      if (newAddon.price === 0) {
        return {
          errors: {
            field: "addon-price",
            message: "H τιμή είναι υποχρεωτική",
            active: true,
          },
        };
      }

      if (newAddon.price < 5) {
        return {
          errors: {
            field: "addon-price",
            message: "H ελάχιστη τιμή είναι 5€",
            active: true,
          },
        };
      }

      if (newAddon.price > 10000) {
        return {
          errors: {
            field: "addon-price",
            message: "H μέγιστη τιμή είναι 10000€",
            active: true,
          },
        };
      }

      if (newAddon.description.length === 0) {
        return {
          errors: {
            field: "addon-description",
            message: "Η περιγραφή πρόσθετου είναι υποχρεωτική",
            active: true,
          },
        };
      }

      if (newAddon.description.length <= 10) {
        return {
          errors: {
            field: "addon-description",
            message: "Η περιγραφή πρόσθετου είναι μικρή",
            active: true,
          },
        };
      }

      // Update the addons list with the new addon
      const updatedAddons = [...state.addons, newAddon];

      // Reset newAddon state
      return {
        errors: initialErrorsState,
        addons: updatedAddons,
        newAddon: initialAddonState,
        showNewAddonInputs: false,
      };
    }),
  deleteAddon: (index) =>
    set((state) => {
      const updatedAddons = [...state.addons];
      updatedAddons.splice(index, 1);
      return {
        addons: updatedAddons,
      };
    }),
  cancelEditingAddon: () =>
    set((state) => ({
      ...state,
      addonEditingMode: false,
      addonEditingInput: 0,
      editingAddon: initialAddonState,
    })),
  saveEditingAddon: () =>
    set((state) => {
      const { editingAddon, editingInput } = state;

      // Make a copy of the addons array
      const updatedAddons = [...state.addons];

      // Update the addon at the editing index with the edited values
      updatedAddons[editingInput] = editingAddon;

      // Validation checks
      if (editingAddon.title.length === 0) {
        return {
          errors: {
            field: "editing-addon-title",
            message: "Ο τίτλος πρόσθετου είναι υποχρεωτικός",
            active: true,
          },
        };
      }

      if (editingAddon.title.length <= 5) {
        return {
          errors: {
            field: "editing-addon-title",
            message: "Ο τίτλος πρόσθετου είναι μικρός",
            active: true,
          },
        };
      }

      if (editingAddon.price === 0) {
        return {
          errors: {
            field: "editing-addon-price",
            message: "H τιμή είναι υποχρεωτική",
            active: true,
          },
        };
      }

      if (editingAddon.price < 5) {
        return {
          errors: {
            field: "editing-addon-price",
            message: "H ελάχιστη τιμή είναι 5€",
            active: true,
          },
        };
      }

      if (editingAddon.price > 10000) {
        return {
          errors: {
            field: "editing-addon-price",
            message: "H μέγιστη τιμή είναι 10000€",
            active: true,
          },
        };
      }

      if (editingAddon.description.length === 0) {
        return {
          errors: {
            field: "editing-addon-description",
            message: "Η περιγραφή πρόσθετου είναι υποχρεωτική",
            active: true,
          },
        };
      }

      if (editingAddon.description.length <= 10) {
        return {
          errors: {
            field: "editing-addon-description",
            message: "Η περιγραφή πρόσθετου είναι μικρή",
            active: true,
          },
        };
      }

      // Reset the editing state
      return {
        errors: initialErrorsState,
        addons: updatedAddons,
        editingAddon: initialAddonState,
        addonEditingInput: 0,
        addonEditingMode: false,
      };
    }),
});

export default useAddonsStore;
