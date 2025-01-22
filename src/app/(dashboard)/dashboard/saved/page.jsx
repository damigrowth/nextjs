import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import SavedInfo from "@/components/ui/dashboard/saved/SavedInfo";
import { getFreelancer } from "@/lib/users/freelancer";
import { inspect } from "@/utils/inspect";

export const metadata = {
  title: "Αποθηκευμένα",
};

export default async function page({ searchParams }) {
  const { freelancer } = await getFreelancer();
  const saved_services =
    freelancer.saved_services.data.length > 0
      ? freelancer.saved_services.data.map((service) => ({
          id: service.id,
          ...service.attributes,
        }))
      : null;

  return <SavedInfo services={saved_services} fid={freelancer.id} />;
}
