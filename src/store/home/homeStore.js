import { create } from "zustand";

const useHomeStore = create((set) => ({
  searchTerm: "",
  setSearchTerm: (term) => set(() => ({ searchTerm: term })),
  isSearchDropdownOpen: false,
  focusDropdown: () => set(() => ({ isSearchDropdownOpen: true })),
  blurDropdown: () => set(() => ({ isSearchDropdownOpen: false })),
  categorySelect: null,
  setCategorySelect: (payload) =>
    set(() => ({
      categorySelect: payload,
      searchTerm: "", // Reset searchTerm
      isSearchDropdownOpen: true, // Show dropdown with category results
    })),
  featuredCategory: "",
  setFeaturedCategory: (payload) => set(() => ({ featuredCategory: payload })),
  taxonomy: 0,
  setTaxonomy: (payload) => set(() => ({ taxonomy: payload })),
}));

export default useHomeStore;
