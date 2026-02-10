import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { DashboardReviewsContainer } from '@/components/dashboard/reviews';
import { getDashboardMetadata } from '@/lib/seo/pages';

export const metadata = getDashboardMetadata('Αξιολογήσεις');

interface ReviewsPageProps {
  searchParams: Promise<{
    r_page?: string;
    g_page?: string;
    rec_page?: string;
    g_rec_page?: string;
  }>;
}

export default async function ReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { r_page, g_page, rec_page, g_rec_page } = await searchParams;

  // Parse pagination params with fallback to 1
  const receivedPage = Number(r_page) || 1;
  const givenPage = Number(g_page) || 1;
  const recommendationsPage = Number(rec_page) || 1;
  const givensRecommendationsPage = Number(g_rec_page) || 1;

  // Check if user is a professional (can receive reviews)
  const isPro = session?.user?.type === 'pro';

  return (
    <DashboardReviewsContainer
      receivedPage={receivedPage}
      givenPage={givenPage}
      recommendationsPage={recommendationsPage}
      givensRecommendationsPage={givensRecommendationsPage}
      isPro={isPro}
    />
  );
}
