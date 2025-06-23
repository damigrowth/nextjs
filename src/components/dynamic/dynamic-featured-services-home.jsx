import dynamic from 'next/dynamic';
import { memo } from 'react';

const FeaturedServicesHome = dynamic(
  () => import('../section').then((mod) => ({ default: mod.FeaturedServicesHome })),
  {
    // Hybrid: Initial data from server ISR, pagination via useLazyQuery
  },
);

const FeaturedServicesHome_D = memo(function FeaturedServicesHome_D({ 
  categories = [], 
  initialServices = [], 
  initialPagination = {} 
}) {
  // Pass server-side data to client component for hybrid approach
  return (
    <FeaturedServicesHome 
      categories={categories}
      initialServices={initialServices}
      initialPagination={initialPagination}
    />
  );
});

export default FeaturedServicesHome_D;
