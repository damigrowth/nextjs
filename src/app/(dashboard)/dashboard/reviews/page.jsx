import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import ReviewsInfo from "@/components/ui/AddService/ReviewsInfo";

export const metadata = {
  title: "Αξιολογήσεις | Doulitsa",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;
// export const dynamicParams = true;

export default function page() {
  return <ReviewsInfo />;
}
