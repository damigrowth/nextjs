import { SiteHeader } from '@/components/admin/site-header';
import { getAdminSession } from '@/actions/admin/helpers';
import { AdminCreateServiceForm } from '@/components/admin/forms/admin-create-service-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Δημιουργία Υπηρεσίας | Admin',
  description: 'Δημιουργήστε μια νέα υπηρεσία και αναθέστε την σε ένα προφίλ',
};

export default async function AdminCreateServicePage() {
  // Verify admin session
  await getAdminSession();

  return (
    <>
      <SiteHeader title='Δημιουργία Υπηρεσίας' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <AdminCreateServiceForm />
        </div>
      </div>
    </>
  );
}
