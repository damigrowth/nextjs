import DashboardNavigation from "@/components/dashboard/header/DashboardNavigation";
import EditServiceForm from "@/components/ui/forms/EditServiceForm";
import { getData } from "@/lib/client/operations";
import { SERVICE_BY_ID } from "@/lib/graphql/queries/main/service";

export const metadata = {
  title: "Διαχείριση Υπηρεσίας",
};

const Wrapper = ({ children, title = "Επεξεργασία Υπηρεσίας" }) => (
  <div className="dashboard__content hover-bgc-color">
    <div className="row pb40">
      <div className="col-lg-12">
        <DashboardNavigation />
      </div>
      <div className="col-lg-9">
        <div className="dashboard_title_area">
          <h2>{title}</h2>
        </div>
      </div>
    </div>
    <div className="col-lg-12 bgc-white bdrs4 p30 mb30">{children}</div>
  </div>
);

export default async function ServiceEditPage({ params }) {
  // Check if we have an ID
  if (!params?.id) {
    return (
      <Wrapper>
        <div className="alert alert-danger">
          <strong>Δεν βρέθηκε η υπηρεσία</strong>
        </div>
      </Wrapper>
    );
  }

  // Fetch service data
  const { service } = await getData(SERVICE_BY_ID, { id: params.id });

  // Check response structure
  if (!service) {
    return (
      <Wrapper>
        <div className="alert alert-danger">
          <strong>
            Κάτι πήγε στραβά!
            <br /> Παρακαλώ ελέγξτε:
          </strong>
          <ul className="mt-2">
            <li>- Τη σύνδεσή σας στο διαδίκτυο</li>
            <li>- Αν η υπηρεσία υπάρχει</li>
            <li>- Αν έχετε δικαίωμα πρόσβασης</li>
          </ul>
        </div>
      </Wrapper>
    );
  }

  // Check data structure
  if (!service.data || !service.data.id || !service.data.attributes) {
    return (
      <Wrapper>
        <div className="alert alert-danger">
          <strong>Δεν βρέθηκαν τα στοιχεία της υπηρεσίας</strong>
        </div>
      </Wrapper>
    );
  }

  // If all checks pass, render the form
  return (
    <Wrapper>
      <EditServiceForm
        service={{ id: service.data.id, ...service.data.attributes }}
      />
    </Wrapper>
  );
}
