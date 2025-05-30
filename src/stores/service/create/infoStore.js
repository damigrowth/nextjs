const initialObjectState = {
  id: 0,
  label: '',
};

const initialInfoState = {
  fixed: true,
  title: '',
  description: '', // Array for the RichText editor
  price: 10,
  subscription_type: 'month',
  time: 1,
  category: initialObjectState,
  subcategory: initialObjectState,
  subdivision: initialObjectState,
  tags: [],
};

const initialErrorsState = {
  field: '',
  message: '',
  active: false,
};

const useInfoStore = (set, get) => ({
  info: initialInfoState,
  showPrice: true,
  setShowPrice: (value) => set({ showPrice: value }),
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
