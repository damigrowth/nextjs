const initialObjectState = {
  id: 0,
  label: '',
};

const initialInfoState = {
  fixed: true,
  title: '',
  description: '',
  price: 10,
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

const useEditInfoStore = (set) => ({
  info: initialInfoState,
  errors: initialErrorsState,
  showPrice: true,
  setShowPrice: (value) => set({ showPrice: value }),
  setInfo: (key, payload) =>
    set((state) => ({
      info: {
        ...state.info,
        [key]: payload,
      },
    })),
});

export default useEditInfoStore;
