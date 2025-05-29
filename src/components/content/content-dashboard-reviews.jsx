import { Suspense } from 'react';

import { DashboardNavigation } from '@/components/navigation';

import { GivenReviewsSection, ReceivedReviewsSection } from '../parts';
import { GivenReviewsSkeleton, ReceivedReviewsSkeleton } from '../skeleton';
import { getAccess } from '@/actions/shared/user';

const ReviewsHeader = () => (
  <div className='row pb40'>
    <div className='col-lg-12'>
      <DashboardNavigation />
    </div>
    <div className='col-lg-12'>
      <div className='dashboard_title_area'>
        <h2>Αξιολογήσεις</h2>
        <p>Δες τις αξιολογήσεις που έχεις ανταλλάξει.</p>
      </div>
    </div>
  </div>
);

export default async function ReviewsInfo({ searchParamsData }) {
  // Check access once at parent level
  const hasAccess = await getAccess(['freelancer', 'company']);

  // Filter only the relevant search params for each section
  const receivedParams = { r_page: searchParamsData?.r_page || 1 };

  const givenParams = { g_page: searchParamsData?.g_page || 1 };

  return (
    <div className='dashboard__content hover-bgc-color'>
      <ReviewsHeader />
      {/* Received Reviews with its own Suspense boundary */}
      {hasAccess && (
        <Suspense
          key={JSON.stringify(receivedParams)}
          fallback={<ReceivedReviewsSkeleton />}
        >
          <ReceivedReviewsSection searchParamsData={searchParamsData} />
        </Suspense>
      )}
      {/* Given Reviews with its own Suspense boundary */}
      <Suspense
        key={JSON.stringify(givenParams)}
        fallback={<GivenReviewsSkeleton />}
      >
        <GivenReviewsSection searchParamsData={searchParamsData} />
      </Suspense>
    </div>
  );
}
