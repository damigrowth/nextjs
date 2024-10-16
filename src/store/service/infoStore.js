import { create } from "zustand";

const initialObjectState = {
  id: 0,
  label: "",
};

const initialInfoState = {
  fixed: true,
  title: "",
  description: "", // Array for the RichText editor
  price: 0,
  time: 0,
  subscription_type: "monthly",
  category: initialObjectState,
  subcategory: initialObjectState,
  subdivision: initialObjectState,
  // tags: [],
};

const initialErrorsState = {
  field: "",
  message: "",
  active: false,
};

const useInfoStore = (set, get) => ({
  info: initialInfoState,
  errors: initialErrorsState,
  setInfo: (key, payload) =>
    set((state) => ({
      info: {
        ...state.info,
        [key]: payload,
      },
    })),
});

export default useInfoStore;
