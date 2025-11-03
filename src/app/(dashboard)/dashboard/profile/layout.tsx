import { ProfileSidebar } from '@/components';
import { getCurrentUser } from '@/actions/auth/server';
import { redirect } from 'next/navigation';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch current user to determine type
  const userResult = await getCurrentUser();
  const user = userResult.data?.user;
  const isProUser = user?.type === 'pro';

  // Redirect simple users from /dashboard/profile root to /account
  // This will be handled in the page.tsx file instead

  return (
    <div className='flex h-full'>
      {/* Only show sidebar for pro users */}
      {isProUser && <ProfileSidebar userType={user?.type || 'user'} />}
      <div className={isProUser ? 'flex-1 p-6' : 'w-full'}>
        {!isProUser ? (
          <div className='mx-auto w-full max-w-5xl px-4 lg:px-6 py-6'>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
