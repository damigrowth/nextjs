import { EmailConfirmationForm } from '@/components/form';
import { Meta } from '@/utils/Seo/Meta/Meta';

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: 'Επιβεβαίωση Email - Doulitsa',
    descriptionTemplate:
      'Επιβεβαιώστε τη διεύθυνση email σας για να ολοκληρώσετε την εγγραφή σας στην Doulitsa.',
    size: 160,
    url: '/email-confirmation',
  });

  return meta;
}

export default async function page({ searchParams }) {
  const { token } = await searchParams;

  return (
    <section className='our-register'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6 m-auto wow fadeInUp' data-wow-delay='300ms'>
            <div className='main-title text-center'>
              <h2 className='title'>Επιβεβαίωση της διεύθυνσής σας email</h2>
              <p className='paragraph'>
                Περιμένετε όσο επιβεβαιώνουμε το email σας...
              </p>
            </div>
          </div>
        </div>
        <div className='row wow fadeInRight' data-wow-delay='300ms'>
          <div className='col-xl-6 mx-auto'>
            <div className='log-reg-form search-modal searchbrd form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12'>
              {/* Pass confirmationToken to the form component */}
              <EmailConfirmationForm confirmationToken={token} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
