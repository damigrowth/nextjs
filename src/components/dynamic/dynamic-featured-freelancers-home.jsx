import dynamic from 'next/dynamic';
import { memo } from 'react';

const FeaturedFreelancersHome = dynamic(
  () => import('../section').then((mod) => ({ default: mod.FeaturedFreelancersHome })),
  {
    // Hybrid: Initial data from server ISR, pagination via useLazyQuery
  },
);

const FeaturedFreelancersHome_D = memo(function FeaturedFreelancersHome_D({ 
  initialFreelancers = [], 
  initialPagination = {} 
}) {
  // Pass server-side data to client component for hybrid approach
  return (
    <FeaturedFreelancersHome 
      initialFreelancers={initialFreelancers}
      initialPagination={initialPagination}
    />
  );
});

export default FeaturedFreelancersHome_D;
