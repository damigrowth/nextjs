import { getCurrentUser } from '@/actions/auth/server';
import { AccountForm, AccountPageActions } from '@/components';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
  // Fetch current user data server-side with fresh session data
  const userResult = await getCurrentUser({ revalidate: true });

  if (!userResult.success || !userResult.data.user) {
    redirect('/login');
  }

  const { user, profile } = userResult.data;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Λογαριασμός</h1>
        <p className='text-muted-foreground'>
          Διαχειριστείτε τις ρυθμίσεις του λογαριασμού σας
        </p>
      </div>

      <AccountForm initialUser={user} />

      {/* Account Actions */}
      <AccountPageActions user={user} />
    </div>
  );
}
