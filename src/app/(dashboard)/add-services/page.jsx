import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AddServiceInfo from "@/components/dashboard/section/AddServiceInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "Doulitsa",
};

export default function page() {
  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        <AddServiceInfo />
      </DashboardLayout>
    </>
  );
}
