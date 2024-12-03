import { create } from "zustand";

const authStore = create((set) => ({
  initialState: {},
  type: 0,
  role: null,
  step: 0,
  consent: false,
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
  setConsent: (consent) => set({ consent }),
  setAuthType: (payload) => set(() => ({ type: payload })),
  setAuthRole: (payload) =>
    set(() => ({
      role: payload,
    })),
}));

export default authStore;
