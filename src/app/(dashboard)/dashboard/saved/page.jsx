import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import SavedInfo from "@/components/ui/AddService/SavedInfo";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Saved",
};

export default function page() {
  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        <SavedInfo />
      </DashboardLayout>
    </>
  );
}
