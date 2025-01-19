import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import AddServiceInfo from "@/components/ui/AddServiceInfo";
import { getUser } from "@/lib/auth/user";
import { getFreelancer } from "@/lib/users/freelancer";
import { inspect } from "@/utils/inspect";

export const metadata = {
  title: "Δημιουργία Υπηρεσίας",
};

export default async function page() {
  const user = await getUser();
  const freelancer = user.freelancer.data.attributes;
  const coverage = freelancer.coverage;

  return (
    <>
      <AddServiceInfo coverage={coverage} />
    </>
  );
}
