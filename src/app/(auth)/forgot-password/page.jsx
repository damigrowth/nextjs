import React from 'react';

import ForgotPasswordForm from '@/components/form/form-auth-forgot-password';
import { Meta } from '@/utils/Seo/Meta/Meta';

export const dynamic = 'force-static';
export const revalidate = false;

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: 'Ξέχασες τον κωδικό σου - Doulitsa',
    descriptionTemplate:
      'Ανακτήστε τον κωδικό πρόσβασης του λογαριασμού σας στην Doulitsa με λίγα απλά βήματα.',
    size: 160,
    url: '/forgot-password',
  });

  return meta;
}

export default function page() {
  return (
    <section className='our-login'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6 m-auto wow fadeInUp' data-wow-delay='300ms'>
            <div className='main-title text-center'>
              <h2 className='title'>Ξέχασες τον κωδικό σου?</h2>
              <p className='paragraph'>
                Γράψε το email σου, για να ανακτήσεις τον κωδικό.
              </p>
            </div>
          </div>
        </div>
        <div className='row wow fadeInRight' data-wow-delay='300ms'>
          <div className='col-xl-6 mx-auto'>
            <div className='log-reg-form search-modal searchbrd form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12'>
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
