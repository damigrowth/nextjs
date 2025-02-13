import { data } from "@/data/pages/about";
import { create } from "zustand";

const initialCoverage = {
  online: false,
  onsite: false,
  onbase: false,
  address: "",
  county: { data: null },
  area: { data: null },
  zipcode: { data: null },
  counties: { data: [] },
  areas: { data: [] },
};

const useEditProfileStore = create((set) => ({
  // Basic Information
  currentTab: 0,
  setCurrentTab: (tab) => set({ currentTab: tab }),

  id: "",
  setId: (value) => set(() => ({ id: value })),

  username: "",
  setUsername: (value) => set(() => ({ username: value })),

  firstName: "",
  setFirstName: (value) => set(() => ({ firstName: value })),

  lastName: "",
  setLastName: (value) => set(() => ({ lastName: value })),

  displayName: "",
  setDisplayName: (value) => set(() => ({ displayName: value })),

  email: "",
  setEmail: (value) => set(() => ({ email: value })),

  phone: undefined,
  setPhone: (value) => set(() => ({ phone: value })),

  verified: false,
  setVerified: (value) => set(() => ({ verified: value })),

  address: "",
  setAddress: (value) => set(() => ({ address: value })),

  website: "",
  setWebsite: (value) => set(() => ({ website: value })),

  tagline: "",
  setTagline: (value) => set(() => ({ tagline: value })),

  rate: 0,
  setRate: (value) => set(() => ({ rate: value })),

  commencement: new Date().getFullYear(),
  setCommencement: (value) => set(() => ({ commencement: value })),

  yearsOfExperience: 0,
  setYearsOfExperience: (value) => set(() => ({ yearsOfExperience: value })),

  description: "",
  setDescription: (value) => set(() => ({ description: value })),

  // Rating & Reviews
  rating: 0,
  setRating: (value) => set(() => ({ rating: value })),

  reviews_total: null,
  setReviewsTotal: (value) => set(() => ({ reviews_total: value })),

  rating_stars_1: null,
  rating_stars_2: null,
  rating_stars_3: null,
  rating_stars_4: null,
  rating_stars_5: null,
  setRatingStars: (stars, value) =>
    set(() => ({ [`rating_stars_${stars}`]: value })),

  // Visibility Settings
  visibility: {
    phone: false,
    email: false,
    address: false,
  },
  setVisibility: (field, value) =>
    set((state) => ({
      visibility: {
        ...state.visibility,
        [field]: value,
      },
    })),

  // Image
  image: { data: null },
  setImage: (value) => set(() => ({ image: value })),

  // Socials
  socials: {
    facebook: { label: "Facebook", url: "" },
    linkedin: { label: "LinkedIn", url: "" },
    x: { label: "X", url: "" },
    youtube: { label: "YouTube", url: "" },
    github: { label: "GitHub", url: "" },
    instagram: { label: "Instagram", url: "" },
    behance: { label: "Behance", url: "" },
    dribbble: null,
  },
  setSocial: (platform, url) =>
    set((state) => ({
      socials: {
        ...state.socials,
        [platform]: {
          ...state.socials[platform],
          url,
        },
      },
    })),

  // Additional Information
  terms: "",
  setTerms: (value) => set(() => ({ terms: value })),

  // Portfolio
  portfolio: { data: [] },
  setPortfolio: (value) => set(() => ({ portfolio: value })),

  // Relationships
  services: { data: [] },
  setServices: (value) => set(() => ({ services: value })),

  skills: { data: [] },
  setSkills: (value) => set(() => ({ skills: value })),

  coverage: initialCoverage,
  setCoverage: (field, value) =>
    set((state) => ({
      coverage: {
        ...state.coverage,
        [field]: value,
      },
    })),

  // Single method to handle all coverage mode switches
  switchCoverageMode: (mode, freelancerCoverage) =>
    set((state) => {
      const newValue = !state.coverage[mode];

      // Online mode logic
      if (mode === "online") {
        if (newValue) {
          return {
            coverage: {
              ...initialCoverage,
              online: true,
            },
          };
        } else {
          return {
            coverage: {
              ...state.coverage,
              online: false,
            },
          };
        }
      }

      // Onbase logic
      if (mode === "onbase") {
        if (newValue) {
          return {
            coverage: {
              ...state.coverage,
              online: false,
              onbase: true,
              address: freelancerCoverage.address,
              zipcode: freelancerCoverage.zipcode,
              county: freelancerCoverage.county,
              area: freelancerCoverage.area,
            },
          };
        } else {
          return {
            coverage: {
              ...state.coverage,
              onbase: false,
              address: initialCoverage.address,
              area: initialCoverage.area,
              county: initialCoverage.county,
              zipcode: initialCoverage.zipcode,
            },
          };
        }
      }

      // Onsite logic
      if (mode === "onsite") {
        if (newValue) {
          return {
            coverage: {
              ...state.coverage,
              online: false,
              onsite: true,
              areas: freelancerCoverage.areas,
              counties: freelancerCoverage.counties,
            },
          };
        } else {
          return {
            coverage: {
              ...state.coverage,
              onsite: false,
              areas: initialCoverage.areas,
              counties: initialCoverage.counties,
            },
          };
        }
      }
    }),

  type: { data: null },
  setType: (value) => set(() => ({ type: value })),

  category: { data: null },
  setCategory: (value) => set(() => ({ category: value })),

  subcategory: { data: null },
  setSubcategory: (value) => set(() => ({ subcategory: value })),

  minBudgets: { data: [] },
  setMinBudgets: (value) => set(() => ({ minBudgets: value })),

  industries: { data: [] },
  setIndustries: (value) => set(() => ({ industries: value })),

  contactTypes: { data: [] },
  setContactTypes: (value) => set(() => ({ contactTypes: value })),

  payment_methods: { data: [] },
  setPaymentMethods: (value) => set(() => ({ payment_methods: value })),

  settlement_methods: { data: [] },
  setSettlementMethods: (value) => set(() => ({ settlement_methods: value })),

  // Bulk Actions
  setProfile: (freelancer) =>
    set(() => ({
      id: freelancer.id || "",
      username: freelancer.username || "",
      firstName: freelancer.firstName || "",
      lastName: freelancer.lastName || "",
      displayName: freelancer.displayName || "",
      email: freelancer.email || "",
      phone: freelancer.phone || null,
      verified: freelancer.verified || false,
      address: freelancer.address || "",
      website: freelancer.website || "",
      tagline: freelancer.tagline || "",
      rate: freelancer.rate || 0,
      commencement: freelancer.commencement || new Date().getFullYear(),
      yearsOfExperience: freelancer.yearsOfExperience || 0,
      description: freelancer.description || "",
      rating: freelancer.rating || 0,
      reviews_total: freelancer.reviews_total || null,
      rating_stars_1: freelancer.rating_stars_1 || null,
      rating_stars_2: freelancer.rating_stars_2 || null,
      rating_stars_3: freelancer.rating_stars_3 || null,
      rating_stars_4: freelancer.rating_stars_4 || null,
      rating_stars_5: freelancer.rating_stars_5 || null,
      visibility: freelancer.visibility || {
        phone: false,
        email: false,
        address: false,
      },
      image: freelancer.image || { data: null },
      socials: freelancer.socials || {},
      terms: freelancer.terms || "",
      portfolio: freelancer.portfolio || { data: [] },
      services: freelancer.services || { data: [] },
      skills: freelancer.skills || { data: [] },
      coverage: freelancer.coverage || {
        online: false,
        onsite: false,
        onbase: false,
        address: "",
        county: { data: null },
        area: { data: null },
        zipcode: { data: null },
        counties: { data: [] },
        areas: { data: [] },
      },
      type: freelancer.type || { data: null },
      category: freelancer.category || { data: null },
      subcategory: freelancer.subcategory || { data: null },
      minBudgets: freelancer.minBudgets || { data: [] },
      industries: freelancer.industries || { data: [] },
      contactTypes: freelancer.contactTypes || { data: [] },
      payment_methods: freelancer.payment_methods || { data: [] },
      settlement_methods: freelancer.settlement_methods || { data: [] },
    })),

  resetProfile: () =>
    set(() => ({
      id: "",
      username: "",
      firstName: "",
      lastName: "",
      displayName: "",
      email: "",
      phone: null,
      verified: false,
      address: "",
      website: "",
      tagline: "",
      rate: 0,
      commencement: new Date().getFullYear(),
      yearsOfExperience: 0,
      description: "",
      rating: 0,
      reviews_total: null,
      rating_stars_1: null,
      rating_stars_2: null,
      rating_stars_3: null,
      rating_stars_4: null,
      rating_stars_5: null,
      visibility: { phone: false, email: false, address: false },
      image: { data: null },
      socials: {},
      terms: "",
      portfolio: { data: [] },
      services: { data: [] },
      skills: { data: [] },
      coverage: {
        online: false,
        onsite: false,
        onbase: false,
        address: "",
        county: { data: null },
        areas: { data: [] },
      },
      type: { data: null },
      category: { data: null },
      subcategory: { data: null },
      minBudgets: { data: [] },
      industries: { data: [] },
      contactTypes: { data: [] },
      payment_methods: { data: [] },
      settlement_methods: { data: [] },
    })),
}));

export default useEditProfileStore;
