import SavedInfo from "@/components/ui/dashboard/saved/SavedInfo";
import { getFreelancer } from "@/lib/users/freelancer";

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

  const saved_freelancers =
    freelancer.saved_freelancers.data.length > 0
      ? freelancer.saved_freelancers.data.map((freelancer) => ({
          id: freelancer.id,
          ...freelancer.attributes,
        }))
      : null;

  return (
    <SavedInfo
      services={saved_services}
      freelancers={saved_freelancers}
      fid={freelancer?.id}
    />
  );
}
