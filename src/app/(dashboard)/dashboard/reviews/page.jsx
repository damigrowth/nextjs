import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import ReviewsInfo from "@/components/ui/AddService/ReviewsInfo";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Review",
};

export default function page() {
  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        <ReviewsInfo />
      </DashboardLayout>
    </>
  );
}
