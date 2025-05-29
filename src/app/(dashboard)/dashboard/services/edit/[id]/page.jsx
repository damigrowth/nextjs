import { getToken } from '@/actions/auth/token';
import { CancelServiceForm, EditServiceForm } from '@/components/form';
import { HeaderDashboardInner } from '@/components/header';
import { getData } from '@/lib/client/operations';
import { SERVICE_BY_ID } from '@/lib/graphql';

export const metadata = {
  title: 'Επεξεργασία Υπηρεσίας',
};

const Wrapper = ({ children, title = 'Επεξεργασία Υπηρεσίας' }) => (
  <div className='dashboard__content dashboard-bg'>
    <HeaderDashboardInner
      title={title}
      buttonText='Διαχείριση Υπηρεσιών'
      buttonHref='/dashboard/services'
      showButton={true}
    />
    <div className='col-lg-12 bgc-white bdrs4 p30 mb30 bgorange'>
      {children}
    </div>
  </div>
);

export default async function ServiceEditPage({ params }) {
  const { id } = await params;

  // Check if we have an ID
  if (!id) {
    return (
      <Wrapper>
        <div className='alert alert-danger'>
          <strong>Δεν βρέθηκε η υπηρεσία</strong>
        </div>
      </Wrapper>
    );
  }

  // Fetch service data
  const { service } = await getData(SERVICE_BY_ID, { id });

  // Check response structure
  if (!service) {
    return (
      <Wrapper>
        <div className='alert alert-danger'>
          <strong>
            Κάτι πήγε στραβά!
            <br /> Ελέγξτε:
          </strong>
          <ul className='mt-2'>
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
        <div className='alert alert-danger'>
          <strong>Δεν βρέθηκαν τα στοιχεία της υπηρεσίας</strong>
        </div>
      </Wrapper>
    );
  }

  const jwt = await getToken();

  // If all checks pass, render the form
  return (
    <Wrapper>
      <EditServiceForm
        service={{ id: service.data.id, ...service.data.attributes }}
        jwt={jwt}
      />
      <CancelServiceForm />
    </Wrapper>
  );
}
