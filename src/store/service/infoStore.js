import { create } from "zustand";

const initialObjectState = {
  id: 0,
  title: "",
};

const initialInfoState = {
  fixed: false,
  title: "",
  description: "", // Array for the RichText editor
  price: 0,
  time: 0,
  category: initialObjectState,
  skills: [],
  location: initialObjectState,
};

const initialErrorsState = {
  field: "",
  message: "",
  active: false,
};

const useInfoStore = (set, get) => ({
  info: initialInfoState,
  errors: initialErrorsState,
  setInfo: (key, value) =>
    set((state) => ({
      info: {
        ...state.info,
        [key]: value,
      },
    })),
});

export default useInfoStore;
