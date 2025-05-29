import { getFreelancer } from '@/actions/shared/freelancer';
import { SavedInfo } from '@/components/content';

export const metadata = {
  title: 'Αποθηκευμένα',
};

export default async function page() {
  const freelancer = await getFreelancer();

  const saved_services =
    freelancer.saved_services.data.length > 0
      ? freelancer.saved_services.data
          .filter((service) => service.attributes.freelancer?.data !== null)
          .map((service) => ({
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
