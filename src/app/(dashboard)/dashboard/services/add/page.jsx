import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import AddServiceInfo from "@/components/ui/AddServiceInfo";
import { getFreelancer } from "@/lib/users/freelancer";

export const metadata = {
  title: "Doulitsa",
};

export default async function page() {
  const { freelancer } = await getFreelancer();
  const { coverage } = freelancer;

  return (
    <>
      {/* <MobileNavigation2 /> */}
      <AddServiceInfo coverage={coverage} />
    </>
  );
}
