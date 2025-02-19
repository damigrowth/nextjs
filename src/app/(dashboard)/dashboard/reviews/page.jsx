import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import ReviewsInfo from "@/components/ui/AddService/ReviewsInfo";

export const metadata = {
  title: "Αξιολογήσεις | Doulitsa",
};

export const dynamic = "force-dynamic";
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
