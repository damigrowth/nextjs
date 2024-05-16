import { create } from "zustand";

const initialObjectState = {
  id: 0,
  title: "",
};

const initialLocationObjectState = {
  id: 0,
  name: "",
};

const initialInfoState = {
  fixed: false,
  title: "",
  description: "", // Array for the RichText editor
  price: 0,
  time: 0,
  category: initialObjectState,
  skills: [],
  county: initialLocationObjectState,
  area: initialLocationObjectState,
  zipcode: initialLocationObjectState,
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
