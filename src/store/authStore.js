import { create } from "zustand";

const authStore = create((set) => ({
  initialState: {},
  type: 0,
  role: null,
  step: 0,
  roles: [
    {
      value: 5,
      label: "Επιχείρηση",
    },
    {
      value: 4,
      label: "Επαγγελματίας",
    },
  ],
  setAuthType: (payload) => set(() => ({ type: payload })),
  setAuthRole: (payload) =>
    set(() => ({
      role: payload,
    })),
}));

export default authStore;
