import { getToken } from '@/actions/auth/token';
import { getUser } from '@/actions/shared/user';
import { AddServiceForm } from '@/components/form';
import { DashboardNavigation } from '@/components/navigation';

export const metadata = {
  title: 'Δημιουργία Υπηρεσίας',
};

export default async function page() {
  const user = await getUser();

  const jwt = await getToken();

  const freelancer = user.freelancer.data.attributes;

  const coverage = freelancer.coverage;

  return (
    <div className='dashboard__content dashboard-bg'>
      <div className='row pb40'>
        <div className='col-lg-12'>
          <DashboardNavigation />
        </div>
        <div className='col-lg-12'>
          <AddServiceForm coverage={coverage} jwt={jwt} />
        </div>
      </div>
    </div>
  );
}
