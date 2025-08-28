import { JSX } from 'react';
import { Metadata } from 'next';

import { Meta } from '@/lib/seo/Meta';
import { FormForgotPassword } from '@/components/auth';
import {
  redirectCompletedUsers,
  redirectOnboardingUsers,
} from '@/actions/auth/server';

export const dynamic = 'force-dynamic';

// Static SEO
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await Meta({
    titleTemplate: 'Ανάκτηση Κωδικού - Doulitsa',
    descriptionTemplate:
      'Ξέχασες τον κωδικό σου; Ακολούθησε τα βήματα για να επαναφέρεις την πρόσβαση στον λογαριασμό σου.',
    size: 160,
    url: '/forgot-password',
  });

  return meta;
}

export default async function ForgotPasswordPage(): Promise<JSX.Element> {
  // Server-side auth check - redirect authenticated users to their dashboard
  await redirectCompletedUsers();

  // Server-side auth check - redirect ONBOARDING users to /onboarding
  await redirectOnboardingUsers();

  return (
    <section className='py-16 bg-gray-50 min-h-screen'>
      <div className='container mx-auto px-4'>
        {/* Title Section */}
        <div className='flex justify-center mb-15'>
          <div className='lg:w-1/2 text-center'>
            <div className='relative mb-15 lg:mb-8'>
              <h2 className='text-2xl lg:text-3xl font-medium text-gray-900 mb-2'>
                Ανάκτηση Κωδικού
              </h2>
              <p className='text-gray-700 font-sans'>
                Εισήγαγε το email σου για να λάβεις οδηγίες επαναφοράς κωδικού.
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className='flex justify-center'>
          <div className='xl:w-1/3 w-full max-w-2xl'>
            <div className='relative bg-white p-12 sm:p-8 rounded-xl shadow-lg border border-gray-300'>
              <div className='mb-8'>
                <h4 className='text-xl font-semibold text-gray-900 mb-2'>
                  Επαναφορά κωδικού πρόσβασης
                </h4>
                <p className='text-gray-600'>
                  Θα σου στείλουμε έναν σύνδεσμο για να δημιουργήσεις νέο κωδικό.
                </p>
              </div>
              <FormForgotPassword />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}