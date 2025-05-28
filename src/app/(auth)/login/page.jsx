import Link from 'next/link';

import LoginForm from '@/components/form/form-auth-login';
import { Meta } from '@/utils/Seo/Meta/Meta';

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: 'Είσοδος - Doulitsa',
    descriptionTemplate:
      'Συνδέσου στον λογαριασμό σου για να αποκτήσεις πρόσβαση στις υπηρεσίες της Doulitsa.',
    size: 160,
    url: '/login',
  });

  return meta;
}

export default async function page() {
  const isUnderMaintenance = false;

  return (
    <section className='our-login'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6 m-auto wow fadeInUp' data-wow-delay='300ms'>
            <div className='main-title text-center'>
              <h2 className='title'>Είσοδος</h2>
              <p className='paragraph'>
                Κάνε σύνδεση ή εγγραφή με έναν από τους παρακάτω τρόπους.
              </p>
            </div>
          </div>
        </div>
        <div className='row wow fadeInRight' data-wow-delay='300ms'>
          <div className='col-xl-6 mx-auto'>
            <div className='log-reg-form search-modal searchbrd form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12'>
              <div className='mb30'>
                <h4>Συνδέσου στον λογαριασμό σου</h4>
                {!isUnderMaintenance && (
                  <p className='text'>
                    Δεν έχεις λογαριασμό;{' '}
                    <Link href='/register' className='text-thm'>
                      Εγγραφή!
                    </Link>
                  </p>
                )}
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
