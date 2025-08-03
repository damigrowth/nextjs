import { redirect } from 'next/navigation';
import { Meta } from '@/lib/seo/Meta';
import { OnboardingForm } from '@/components/forms';
import { getCurrentUser } from '@/actions/auth/server';

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
  const userResult = await getCurrentUser();

  // Redirect if user is not authenticated
  if (!userResult.success || !userResult.data || !userResult.data.user) {
    console.log('Onboarding page - No user data, redirecting to login');
    redirect('/login');
  }

  const { user, profile } = userResult.data;

  // Redirect if user doesn't need onboarding
  if (user.step !== 'ONBOARDING') {
    console.log('Onboarding page - Wrong step, redirecting to dashboard:', {
      currentStep: user.step,
      expectedStep: 'ONBOARDING',
    });
    redirect('/dashboard');
  }

  // Redirect if user is not a professional (freelancer or company)
  if (user.role === 'user') {
    console.log('Onboarding page - Simple user, redirecting to dashboard');
    redirect('/dashboard');
  }

  return (
    <section className='py-16 bg-gray-50 min-h-screen'>
      <div className='container mx-auto px-4'>
        {/* Title Section */}
        <div className='flex justify-center mb-15'>
          <div className='lg:w-1/2 text-center'>
            <div className='relative mb-15 lg:mb-8'>
              <h2 className='mb-2'>Ας ολοκληρώσουμε το προφίλ σας</h2>
              <p className='text-gray-700 font-sans'>
                Αυτό θα βοηθήσει τους άλλους να σας βρουν και να επικοινωνήσουν
                μαζί σας.
              </p>
            </div>
          </div>
        </div>
        <OnboardingForm user={user} />
      </div>
    </section>
  );
}
