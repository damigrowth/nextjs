import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/shared/auth';
import { Meta } from 'oldcode/utils/Seo/Meta/Meta';
import OnboardingForm from '@/components/form/form-onboarding';

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
  const user = await getCurrentUser();

  // Redirect if user is not authenticated
  if (!user) {
    redirect('/login');
  }

  // Redirect if user doesn't need onboarding
  if (user.step !== 'ONBOARDING') {
    redirect('/dashboard');
  }

  // Redirect if user is not a professional (freelancer or company)
  if (user.role === 'user') {
    redirect('/dashboard');
  }
  return (
    <section className='our-register'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-8 m-auto wow fadeInUp' data-wow-delay='300ms'>
            <div className='main-title text-center'>
              <h2 className='title'>Ας ολοκληρώσουμε το προφίλ σας</h2>
              <p className='paragraph'>
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
