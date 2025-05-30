import { create } from 'zustand';

// Initialize coverage in a way that handles null values gracefully
const getInitialCoverage = () => {
  try {
    return {
      online: false,
      onsite: false,
      onbase: false,
      address: '',
      county: { data: null },
      area: { data: null },
      zipcode: { data: null },
      counties: { data: [] },
      areas: { data: [] },
    };
  } catch (error) {
    console.error('Error initializing coverage:', error);

    return null;
  }
};

// Use the function to initialize coverage safely
const initialCoverage = getInitialCoverage();

const initialSocials = {
  facebook: { url: null },
  linkedin: { url: null },
  x: { url: null },
  youtube: { url: null },
  github: { url: null },
  instagram: { url: null },
  behance: { url: null },
  dribbble: { url: null },
};

const useEditProfileStore = create((set) => ({
  // Basic Information
  currentTab: 0,
  setCurrentTab: (tab) => set({ currentTab: tab }),
  id: '',
  setId: (value) => set(() => ({ id: value })),
  username: '',
  setUsername: (value) => set(() => ({ username: value })),
  firstName: '',
  setFirstName: (value) => set(() => ({ firstName: value })),
  lastName: '',
  setLastName: (value) => set(() => ({ lastName: value })),
  displayName: '',
  setDisplayName: (value) => set(() => ({ displayName: value })),
  email: '',
  setEmail: (value) => set(() => ({ email: value })),
  phone: undefined,
  setPhone: (value) => set(() => ({ phone: value })),
  viber: null,
  setViber: (value) => set(() => ({ viber: value })),
  whatsapp: null,
  setWhatsapp: (value) => set(() => ({ whatsapp: value })),
  verified: false,
  setVerified: (value) => set(() => ({ verified: value })),
  address: '',
  setAddress: (value) => set(() => ({ address: value })),
  website: '',
  setWebsite: (value) => set(() => ({ website: value })),
  tagline: '',
  setTagline: (value) => set(() => ({ tagline: value })),
  rate: 0,
  setRate: (value) => set(() => ({ rate: value })),
  commencement: 0,
  setCommencement: (value) => set(() => ({ commencement: value })),
  yearsOfExperience: 0,
  setYearsOfExperience: (value) => set(() => ({ yearsOfExperience: value })),
  description: '',
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
  socials: null,
  setSocial: (platform, url) =>
    set((state) => ({
      socials: {
        ...state.socials,
        [platform]: { url },
      },
    })),
  // Additional Information
  terms: '',
  setTerms: (value) => set(() => ({ terms: value })),
  // Portfolio
  portfolio: { data: [] },
  setPortfolio: (value) => set(() => ({ portfolio: value })),
  // Relationships
  services: { data: [] },
  setServices: (value) => set(() => ({ services: value })),
  skills: { data: [] },
  setSkills: (value) => set(() => ({ skills: value })),
  specialization: { data: null },
  setSpecialization: (value) => set(() => ({ specialization: value })),
  coverage: initialCoverage,
  setCoverage: (field, value) =>
    set((state) => {
      // If coverage is null, initialize it first
      if (state.coverage === null) {
        return {
          coverage: {
            ...initialCoverage,
            [field]: value,
          },
        };
      }

      return {
        coverage: {
          ...state.coverage,
          [field]: value,
        },
      };
    }),
  // Single method to handle all coverage mode switches
  switchCoverageMode: (mode, freelancerCoverage) =>
    set((state) => {
      // If coverage is null, initialize it first
      if (state.coverage === null) {
        return {
          coverage: {
            ...initialCoverage,
            [mode]: true,
          },
        };
      }

      const newValue = !state.coverage[mode];

      const newCoverage = { ...state.coverage };

      // Toggle the selected mode without affecting others
      newCoverage[mode] = newValue;
      // Initialize fields for the specific mode if it's being enabled
      if (newValue) {
        if (mode === 'onbase') {
          // Set onbase-specific fields from freelancerCoverage or keep the current ones
          newCoverage.address =
            (freelancerCoverage && freelancerCoverage.address) ||
            newCoverage.address;
          newCoverage.zipcode =
            (freelancerCoverage && freelancerCoverage.zipcode) ||
            newCoverage.zipcode;
          newCoverage.county =
            (freelancerCoverage && freelancerCoverage.county) ||
            newCoverage.county;
          newCoverage.area =
            (freelancerCoverage && freelancerCoverage.area) || newCoverage.area;
        } else if (mode === 'onsite') {
          // Set onsite-specific fields from freelancerCoverage or keep the current ones
          newCoverage.areas =
            (freelancerCoverage && freelancerCoverage.areas) ||
            newCoverage.areas;
          newCoverage.counties =
            (freelancerCoverage && freelancerCoverage.counties) ||
            newCoverage.counties;
        }
      }
      // Reset fields for the specific mode if it's being disabled
      else {
        if (mode === 'onbase') {
          newCoverage.address = initialCoverage.address;
          newCoverage.area = initialCoverage.area;
          newCoverage.county = initialCoverage.county;
          newCoverage.zipcode = initialCoverage.zipcode;
        } else if (mode === 'onsite') {
          newCoverage.areas = initialCoverage.areas;
          newCoverage.counties = initialCoverage.counties;
        }
      }

      return { coverage: newCoverage };
    }),
  type: { data: null },
  setType: (value) => set(() => ({ type: value })),
  category: { data: null },
  setCategory: (value) => set(() => ({ category: value })),
  subcategory: { data: null },
  setSubcategory: (value) => set(() => ({ subcategory: value })),
  minBudget: { data: null },
  setMinBudget: (value) => set(() => ({ minBudget: value })),
  industries: { data: [] },
  setIndustries: (value) => set(() => ({ industries: value })),
  contactTypes: { data: [] },
  setContactTypes: (value) => set(() => ({ contactTypes: value })),
  payment_methods: { data: [] },
  setPaymentMethods: (value) => set(() => ({ payment_methods: value })),
  settlement_methods: { data: [] },
  setSettlementMethods: (value) => set(() => ({ settlement_methods: value })),
  size: { data: null },
  setSize: (value) => set(() => ({ size: value })),
  billing_details: {
    receipt: false,
    invoice: false,
    afm: null,
    doy: null,
    brandName: null,
    profession: null,
    address: null,
  },
  setBillingDetails: (value) => set(() => ({ billing_details: value })),
  // Bulk Actions
  setProfile: (freelancer) =>
    set(() => ({
      id: freelancer.id || '',
      username: freelancer.username || '',
      firstName: freelancer.firstName || '',
      lastName: freelancer.lastName || '',
      displayName: freelancer.displayName || '',
      email: freelancer.email || '',
      phone: freelancer.phone || null,
      viber: freelancer.viber || null, // Add viber
      whatsapp: freelancer.whatsapp || null, // Add whatsapp
      verified: freelancer.verified || false,
      address: freelancer?.coverage?.address || '', // Setting it from the coverage address
      website: freelancer.website || '',
      tagline: freelancer.tagline || '',
      rate: freelancer.rate || 0,
      commencement: freelancer.commencement || 0,
      yearsOfExperience: freelancer.yearsOfExperience || 0,
      description: freelancer.description || '',
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
      socials: freelancer.socials || initialSocials,
      terms: freelancer.terms || '',
      portfolio: freelancer.portfolio || { data: [] },
      services: freelancer.services || { data: [] },
      skills: freelancer.skills || { data: [] },
      specialization: freelancer.specialization || { data: null },
      coverage:
        freelancer.coverage === null
          ? null
          : freelancer.coverage || initialCoverage,
      type: freelancer.type || { data: null },
      category: freelancer.category || { data: null },
      subcategory: freelancer.subcategory || { data: null },
      minBudget: freelancer.minBudget || { data: null },
      industries: freelancer.industries || { data: [] },
      contactTypes: freelancer.contactTypes || { data: [] },
      payment_methods: freelancer.payment_methods || { data: [] },
      settlement_methods: freelancer.settlement_methods || { data: [] },
      size: freelancer.size || { data: null },
      billing_details: freelancer.billing_details || {
        receipt: false,
        invoice: false,
        afm: null,
        doy: null,
        brandName: null,
        profession: null,
        address: null,
      },
    })),
  resetProfile: () =>
    set(() => ({
      id: '',
      username: '',
      firstName: '',
      lastName: '',
      displayName: '',
      email: '',
      phone: null,
      viber: null, // Reset viber
      whatsapp: null, // Reset whatsapp
      verified: false,
      address: '',
      website: '',
      tagline: '',
      rate: 0,
      commencement: 0,
      yearsOfExperience: 0,
      description: '',
      rating: 0,
      reviews_total: null,
      rating_stars_1: null,
      rating_stars_2: null,
      rating_stars_3: null,
      rating_stars_4: null,
      rating_stars_5: null,
      visibility: { phone: false, email: false, address: false },
      image: { data: null },
      socials: initialSocials,
      terms: '',
      portfolio: { data: [] },
      services: { data: [] },
      skills: { data: [] },
      specialization: { data: null },
      coverage: initialCoverage,
      type: { data: null },
      category: { data: null },
      subcategory: { data: null },
      minBudget: { data: null },
      industries: { data: [] },
      contactTypes: { data: [] },
      payment_methods: { data: [] },
      settlement_methods: { data: [] },
      size: { data: null },
      billing_details: {
        receipt: true,
        invoice: false,
        afm: null,
        doy: null,
        brandName: null,
        profession: null,
        address: null,
      },
    })),
}));

export default useEditProfileStore;
