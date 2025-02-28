const initialState = {
  typeStep: 0,
  type: {
    online: null,
    presence: null,
    oneoff: null,
    subscription: null,
    onsite: null,
    onbase: null,
  },
  primaryType: null, // 'online' or 'presence'
  secondaryType: null, // 'oneoff', 'subscription', 'onsite', or 'onbase'
};

const useTypeStore = (set) => ({
  ...initialState,

  goBack: () => set((state) => ({ ...state, typeStep: 0 })),

  setType: (type) =>
    set((state) => {
      switch (type) {
        case "online": {
          return {
            ...state,
            type: {
              ...state.type,
              online: true,
              presence: false,
            },
            typeStep: 1,
          };
        }
        case "presence": {
          return {
            ...state,
            type: {
              ...state.type,
              online: false,
              presence: true,
            },
            typeStep: 1,
          };
        }
        case "oneoff": {
          return {
            ...state,
            type: {
              ...state.type,
              online: true,
              presence: false,
              oneoff: true,
              subscription: false,
              onsite: null,
              onbase: null,
            },
            typeStep: 2,
          };
        }
        case "subscription": {
          return {
            ...state,
            type: {
              ...state.type,
              online: true,
              presence: false,
              oneoff: false,
              subscription: true,
              onsite: null,
              onbase: null,
            },
            typeStep: 2,
          };
        }
        case "onsite": {
          return {
            ...state,
            type: {
              ...state.type,
              online: false,
              presence: true,
              oneoff: null,
              subscription: null,
              onsite: true,
              onbase: false,
            },
            typeStep: 2,
          };
        }
        case "onbase": {
          return {
            ...state,
            type: {
              ...state.type,
              online: false,
              presence: true,
              oneoff: null,
              subscription: null,
              onsite: false,
              onbase: true,
            },
            typeStep: 2,
          };
        }
        default: {
          return state;
        }
      }
    }),

  setPrimaryType: (type) =>
    set((state) => {
      if (type !== "online" && type !== "presence") {
        return state; // Invalid type, don't update
      }
      return {
        primaryType: type,
        secondaryType: null, // Reset secondary type when primary changes
        typeStep: 1,
      };
    }),

  setSecondaryType: (type) =>
    set((state) => {
      const validTypes = {
        online: ["oneoff", "subscription"],
        presence: ["onsite", "onbase"],
      };

      if (!state.primaryType || !validTypes[state.primaryType].includes(type)) {
        return state; // Invalid type or primary not set, don't update
      }

      return {
        ...state,
        secondaryType: type,
        typeStep: 2,
      };
    }),

  resetTypes: () => set(initialState),
});

export default useTypeStore;
