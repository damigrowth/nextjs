import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth/server';
import OAuthSetupForm from '@/components/auth/oauth-setup-form';
import { Meta } from '@/lib/seo/Meta';

export const dynamic = 'force-dynamic';

// Static SEO
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await Meta({
    titleTemplate: 'Ολοκλήρωση Εγγραφής - Doulitsa',
    descriptionTemplate:
      'Ολοκληρώστε την εγγραφή σας συμπληρώνοντας τα στοιχεία σας.',
    size: 160,
    url: '/oauth-setup',
  });

  return meta;
}

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function OAuthSetupPage({ searchParams }: PageProps) {
  // Get current user - disable caching to get fresh data for OAuth flow
  const userResult = await getCurrentUser({ revalidate: true });

  // Redirect if user is not authenticated
  if (!userResult.success || !userResult.data || !userResult.data.user) {
    redirect('/login');
  }

  const user = userResult.data.user;
  // console.log('OAUTH-SETUP PAGE - SERVER SIDE USER', user);

  // Check if this is a Google OAuth user who needs setup
  const needsSetup =
    user.provider === 'google' &&
    user.step === 'OAUTH_SETUP' &&
    !user.confirmed;

  if (!needsSetup) {
    // User doesn't need setup, redirect to appropriate page based on type and step
    if (user.type === 'pro' && user.step === 'ONBOARDING') {
      redirect('/onboarding');
    } else if (user.step === 'DASHBOARD') {
      redirect('/dashboard');
    } else {
      // Fallback redirect
      redirect('/dashboard');
    }
  }

  // Get type and role from URL parameters (passed from register page) - Next.js 15 requires await
  const params = await searchParams;
  const urlType = params.type;

  // Prioritize URL parameter for type determination
  // URL parameter represents the user's registration intent and should override database record
  const userType = urlType || 'user';

  return (
    <section className='mt-20 pt-20 pb-40 bg-gray-50'>
      <div className='container mx-auto px-4'>
        {/* Title Section */}
        <div className='flex justify-center mb-15'>
          <div className='lg:w-1/2 text-center'>
            <div className='relative mb-15 lg:mb-8'>
              <h2 className='text-2xl lg:text-3xl font-medium text-gray-900 mb-2'>
                Ολοκλήρωση Εγγραφής με Google
              </h2>
              <p className='text-gray-700 font-sans'>
                Συνδεθήκατε επιτυχώς ως {user.email}.
                {userType === 'pro'
                  ? 'Παρακαλώ συμπληρώστε τα στοιχεία του επαγγελματικού σας προφίλ.'
                  : 'Παρακαλώ επιλέξτε ένα username για τον λογαριασμό σας.'}
              </p>
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <p className='text-xs text-gray-500 mt-2'>
                  Debug: urlType="{urlType}", userType="{userType}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className='flex justify-center'>
          <div className='xl:w-2/5 w-full max-w-2xl'>
            <div className='relative bg-white p-12 sm:p-8 rounded-xl shadow-lg border border-gray-300'>
              <OAuthSetupForm
                userEmail={user.email}
                userType={userType}
                googleUsername={user.username}
                googleDisplayName={user.displayName}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
