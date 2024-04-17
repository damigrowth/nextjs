import { create } from "zustand";

const initialInfoState = {
  title: "",
  description: "", // Array for the RichText editor
  price: 0,
  time: 0,
  category: {
    id: 0,
    title: "",
  },
  skills: [],
};

const initialErrorsState = {
  field: "",
  message: "",
  active: false,
};

const useInfoStore = ((set, get) => ({
  info: initialInfoState,
  errors: initialErrorsState,
  setInfo: (key, value) =>
    set((state) => ({
      info: {
        ...state.info,
        [key]: value,
      },
    })),
}));

export default useInfoStore;
