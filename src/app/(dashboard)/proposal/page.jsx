import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import ProposalInfo from "@/components/ui/AddService/ProposalInfo";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Proposal",
};

export default function page() {
  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        <ProposalInfo />
      </DashboardLayout>
    </>
  );
}
