import { DashboardHeader } from "@/components/ui/dashboard/DashboardHeader";
import { TabContent } from "@/components/ui/dashboard/profile/TabContent";

export default function MyProfileInfo() {
  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <DashboardHeader title="Διαχείριση Προφίλ" />
        <TabContent />
      </div>
    </>
  );
}
