import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AddServiceInfo from "@/components/dashboard/section/AddServiceInfo";

import MobileNavigation2 from "@/components/header/MobileNavigation2";
import { fetchModel } from "@/lib/models/model";
import { CATEGORIES, LOCATIONS_SEARCH, SKILLS } from "@/lib/queries";

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
