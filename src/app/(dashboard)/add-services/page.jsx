import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import AddServiceInfo from "@/components/ui/AddServiceInfo";

export const metadata = {
  title: "Doulitsa",
};

export default async function page() {
  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        <AddServiceInfo />
      </DashboardLayout>
    </>
  );
}
