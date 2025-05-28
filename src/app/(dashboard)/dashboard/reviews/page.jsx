import { ReviewsInfo } from '@/components/content';

export const metadata = {
  title: 'Αξιολογήσεις | Doulitsa',
};

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

// export const dynamicParams = true;
export default async function page({ searchParams }) {
  const { r_page, g_page } = (await searchParams) || {};

  const searchParamsData = {
    r_page: Number(r_page) || 1,
    g_page: Number(g_page) || 1,
  };

  return <ReviewsInfo searchParamsData={searchParamsData} />;
}
