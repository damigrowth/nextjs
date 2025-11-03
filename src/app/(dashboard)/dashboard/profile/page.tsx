import { getDashboardMetadata } from '@/lib/seo/pages';
import { getCurrentUser } from '@/actions/auth/server';
import { redirect } from 'next/navigation';

export const metadata = getDashboardMetadata('Διαχείριση');

export default async function EditProfilePage() {
  // Redirect simple users to account page
  const userResult = await getCurrentUser();
  if (userResult.data?.user?.type === 'user') {
    redirect('/dashboard/profile/account');
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Διαχείριση</h1>
        <p className='text-muted-foreground'>
          Επιλέξτε μία από τις παρακάτω κατηγορίες για να επεξεργαστείτε το
          προφίλ σας
        </p>
      </div>

      <div className='bg-card rounded-lg p-6'>
        <p>
          Καλώς ήρθατε στη διαχείριση του προφίλ σας. Χρησιμοποιήστε το μενού
          στα αριστερά για να πλοηγηθείτε στις διάφορες ενότητες.
        </p>
      </div>
    </div>
  );
}
