import { create } from "zustand";

const authStore = create((set) => ({
  role: 0,
  step: 0,
  initialState: {},
  setAuthRole: (payload) =>
    set(() => ({
      role: payload,
      step: payload,
      initialState: {},
    })),
}));

export default authStore;
