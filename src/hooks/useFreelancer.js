import useFreelancerStore from '@/stores/freelancer';

/**
 * Hook that provides freelancer data
 */
export function useFreelancer() {
  return useFreelancerStore((state) => ({
    fid: state.fid,
    savedServices: state.savedServices,
    savedFreelancers: state.savedFreelancers,
    isLoading: state.isLoading,
  }));
}
