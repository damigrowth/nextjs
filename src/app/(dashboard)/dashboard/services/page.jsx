// page.jsx
import ManageServiceInfo from "@/components/dashboard/section/ManageServiceInfo";
import { getFreelancerId } from "@/lib/users/freelancer";

export const metadata = {
  title: "Διαχείριση Υπηρεσιών",
};

export default async function ServicesPage({ searchParams }) {
  const fid = await getFreelancerId();
  if (!fid) {
    return (
      <div className="dashboard__content">
        <div className="alert alert-danger">
          <strong>Δεν βρέθηκε το προφίλ</strong>
        </div>
      </div>
    );
  }

  const { page: pageNumber } = await searchParams;

  const page = Number(pageNumber) || 1;

  return <ManageServiceInfo fid={fid} page={page} />;
}
