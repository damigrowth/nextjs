import { Meta } from 'oldcode/utils/Seo/Meta/Meta';
import { IconExclamationCircle } from '@/components/icon/fa';

export const dynamic = 'force-dynamic';

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: 'Λογαριασμός Αποκλεισμένος - Doulitsa',
    descriptionTemplate: 'Ο λογαριασμός σας έχει αποκλειστεί προσωρινά.',
    size: 160,
    url: '/auth/blocked',
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
              <h2 className='title text-danger'>Λογαριασμός Αποκλεισμένος</h2>
              <p className='paragraph'>
                Ο λογαριασμός σας έχει αποκλειστεί προσωρινά.
              </p>
            </div>
          </div>
        </div>
        <div className='row wow fadeInRight' data-wow-delay='300ms'>
          <div className='col-xl-6 mx-auto'>
            <div className='log-reg-form search-modal searchbrd form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12'>
              <div className='text-center'>
                <div className='mb-3 text-danger'>
                  <IconExclamationCircle size='3x' />
                </div>
                <h4 className='mb-2 text-danger'>
                  Ο λογαριασμός σας έχει αποκλειστεί
                </h4>
                <p className='text-danger mb-3'>
                  Ο λογαριασμός σας έχει αποκλειστεί προσωρινά. Εάν πιστεύετε
                  ότι αυτό είναι λάθος, παρακαλώ επικοινωνήστε με την ομάδα
                  υποστήριξής μας.
                </p>

                <div className='d-flex gap-2 justify-content-center mb-3'>
                  <a href='/contact' className='ud-btn btn-thm'>
                    Επικοινωνία
                  </a>
                </div>

                <div className='mt-4 p-3 bg-light rounded'>
                  <h6 className='text-muted mb-2'>Χρειάζεστε βοήθεια;</h6>
                  <p className='text-muted small mb-0'>
                    Επικοινωνήστε μαζί μας στο{' '}
                    <a
                      href='mailto:contact@doulitsa.gr'
                      className='text-decoration-none'
                    >
                      contact@doulitsa.gr
                    </a>{' '}
                    και θα σας βοηθήσουμε άμεσα.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
