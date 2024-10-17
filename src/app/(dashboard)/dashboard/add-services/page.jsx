import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import AddServiceInfo from "@/components/ui/AddServiceInfo";
import { getFreelancer } from "@/lib/freelancer/freelancer";

export const metadata = {
  title: "Doulitsa",
};

export default async function page() {
  const { freelancer } = await getFreelancer();
  const { base, coverage } = freelancer;

  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        <AddServiceInfo base={base} coverage={coverage} />
      </DashboardLayout>
    </>
  );
}
