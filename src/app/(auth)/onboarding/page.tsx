import { redirect } from 'next/navigation';
import { Meta } from '@/lib/seo/Meta';
import { getCurrentUser } from '@/actions/auth/server';
import { OnboardingForm } from '@/components';

export const dynamic = 'force-dynamic';

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: 'Ολοκλήρωση Εγγραφής - Doulitsa',
    descriptionTemplate:
      'Ολοκληρώστε την εγγραφή σας στην Doulitsa συμπληρώνοντας το προφίλ σας.',
    size: 160,
    url: '/onboarding',
  });

  return meta;
}

export default async function page() {
  const userResult = await getCurrentUser({ revalidate: true });

  // Redirect if user is not authenticated
  if (!userResult.success || !userResult.data || !userResult.data.user) {
    console.log('Onboarding page - No user data, redirecting to login');
    redirect('/login');
  }

  const { user, profile } = userResult.data;

  // console.log('ONBOARDING PAGE - SERVER SIDE USER', user);

  // Redirect if user doesn't need onboarding
  if (user.step !== 'ONBOARDING') {
    redirect('/dashboard');
  }

  // Redirect if user is not a professional type
  // Check by type field instead of role, since role might not be set yet during OAuth flow
  if (user.type === 'user') {
    redirect('/dashboard');
  }

  return (
    <section className='mt-20 pt-20 pb-40 bg-gray-50'>
      <div className='container mx-auto px-4'>
        {/* Title Section */}
        <div className='flex justify-center mb-15'>
          <div className='lg:w-1/2 text-center'>
            <div className='relative mb-15 lg:mb-8'>
              <h2 className='text-2xl lg:text-3xl font-medium text-gray-900 mb-2'>
                Ολοκλήρωση Εγγραφής
              </h2>
              <p className='text-gray-700 font-sans'>
                Αυτό θα βοηθήσει τους άλλους να σας βρουν και να επικοινωνήσουν
                μαζί σας.
              </p>
            </div>
          </div>
        </div>
        {/* Form Section */}
        <div className='flex justify-center'>
          <div className='xl:w-3/5 w-full max-w-3xl'>
            <div className='relative bg-white p-12 sm:p-8 rounded-xl shadow-lg border border-gray-300'>
              <OnboardingForm user={user} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
