import { create } from 'zustand';
import { getFreelancer } from '@/actions/shared/freelancer';

const useFreelancerStore = create((set, get) => ({
  // Freelancer state
  fid: null,
  username: null,
  displayName: null,
  firstName: null,
  lastName: null,
  image: null,
  hasAccess: false,
  isAuthenticated: false,

  // Saved items
  savedServices: [],
  savedFreelancers: [],

  // Loading state
  isLoading: true,
  isFetched: false,

  // Actions
  fetchFreelancer: async () => {
    const state = get();
    if (state.isFetched) return; // Only fetch once per session

    try {
      const freelancer = await getFreelancer();

      if (freelancer) {
        // Derive user info from freelancer data
        const freelancerType = freelancer.type?.data?.attributes?.slug;
        const hasAccess = ['freelancer', 'company'].includes(freelancerType);

        // Build user object from freelancer data

        set({
          fid: freelancer.id,
          username: freelancer.username,
          displayName: freelancer.displayName,
          firstName: freelancer.firstName,
          lastName: freelancer.lastName,
          image: freelancer.image,
          hasAccess: hasAccess,
          isAuthenticated: !!freelancer.id,
          isConfirmed: !!freelancer.confirmed,
          savedServices: freelancer.saved_services?.data || [],
          savedFreelancers: freelancer.saved_freelancers?.data || [],
          isLoading: false,
          isFetched: true,
        });
      } else {
        // No freelancer data - user not logged in or not a freelancer
        set({
          fid: null,
          username: null,
          displayName: null,
          firstName: null,
          lastName: null,
          image: null,
          hasAccess: false,
          isAuthenticated: false,
          isConfirmed: false,
          savedServices: [],
          savedFreelancers: [],
          isLoading: false,
          isFetched: true,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching freelancer data:', error);
      set({
        fid: null,
        username: null,
        displayName: null,
        firstName: null,
        lastName: null,
        image: null,
        hasAccess: false,
        isAuthenticated: false,
        isConfirmed: false,
        savedServices: [],
        savedFreelancers: [],
        isLoading: false,
        isFetched: true,
      });
    }
  },

  // Update saved items (for save forms)
  updateSavedService: (serviceId, isSaved) => {
    set((state) => {
      const serviceIdStr = String(serviceId);
      const currentSaved = state.savedServices;

      if (isSaved) {
        const alreadySaved = currentSaved.some(
          (s) => String(s.id) === serviceIdStr,
        );
        if (!alreadySaved) {
          return {
            savedServices: [...currentSaved, { id: serviceIdStr }],
          };
        }
      } else {
        return {
          savedServices: currentSaved.filter(
            (s) => String(s.id) !== serviceIdStr,
          ),
        };
      }

      return state; // No change needed
    });
  },

  updateSavedFreelancer: (freelancerId, isSaved) => {
    set((state) => {
      const freelancerIdStr = String(freelancerId);
      const currentSaved = state.savedFreelancers;

      if (isSaved) {
        const alreadySaved = currentSaved.some(
          (f) => String(f.id) === freelancerIdStr,
        );
        if (!alreadySaved) {
          return {
            savedFreelancers: [...currentSaved, { id: freelancerIdStr }],
          };
        }
      } else {
        return {
          savedFreelancers: currentSaved.filter(
            (f) => String(f.id) !== freelancerIdStr,
          ),
        };
      }

      return state; // No change needed
    });
  },

  // Reset freelancer state (for logout)
  resetFreelancer: () => {
    set({
      fid: null,
      username: null,
      displayName: null,
      firstName: null,
      lastName: null,
      image: null,
      hasAccess: false,
      isAuthenticated: false,
      isConfirmed: false,
      savedServices: [],
      savedFreelancers: [],
      isLoading: false,
      isFetched: false, // Allow refetch after logout
    });
  },
}));

export default useFreelancerStore;
