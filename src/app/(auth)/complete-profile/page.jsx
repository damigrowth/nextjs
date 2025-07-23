import OAuthProfileCompletionForm from '@/components/form/form-auth-oauth-profile-completion';
import { Meta } from 'oldcode/utils/Seo/Meta/Meta';

export const dynamic = 'force-dynamic';

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: 'Ολοκλήρωση Προφίλ - Doulitsa',
    descriptionTemplate:
      'Ολοκληρώστε το προφίλ σας για να αποκτήσετε πρόσβαση στις υπηρεσίες της Doulitsa.',
    size: 160,
    url: '/auth/complete-profile',
  });

  return meta;
}

export default function page() {
  return (
    <section className='our-register'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6 m-auto wow fadeInUp' data-wow-delay='300ms'>
            <div className='main-title text-center'>
              <h2 className='title'>Σχεδόν τελειώσαμε!</h2>
              <p className='paragraph'>
                Παρακαλώ ολοκληρώστε το προφίλ σας για να συνεχίσετε.
              </p>
            </div>
          </div>
        </div>
        <div className='row wow fadeInRight' data-wow-delay='300ms'>
          <div className='col-xl-6 mx-auto'>
            <div className='log-reg-form search-modal searchbrd form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12'>
              <OAuthProfileCompletionForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
