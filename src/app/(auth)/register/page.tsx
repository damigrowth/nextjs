import { Metadata } from 'next';
import LinkNP from '@/components/link';

import { Meta } from '@/lib/seo/Meta';
import {
  redirectOnboardingUsers,
  redirectCompletedUsers,
} from '@/actions/auth/server';
import {
  AuthTypeOptions,
  FormAuthRegister,
  HeadingFormRegister,
} from '@/components/auth';
import { JSX } from 'react';

export const dynamic = 'force-dynamic';

// Static SEO
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await Meta({
    titleTemplate: 'Εγγραφή - Doulitsa',
    descriptionTemplate:
      'Δημιούργησε τον λογαριασμό σου στην Doulitsa και ξεκίνησε να προσφέρεις ή να αναζητάς υπηρεσίες.',
    size: 160,
    url: '/register',
  });

  return meta;
}

export default async function RegisterPage(): Promise<JSX.Element> {
  // Server-side auth check - redirect authenticated users to their dashboard
  await redirectCompletedUsers();

  // Server-side auth check - redirect ONBOARDING users to /onboarding
  await redirectOnboardingUsers();

  return (
    <section className='mt-20 pt-20 pb-40 bg-gray-50'>
      <div className='container mx-auto px-4'>
        {/* Title Section */}
        <div className='flex justify-center mb-15'>
          <div className='lg:w-1/2 text-center'>
            <div className='relative mb-15 lg:mb-8'>
              <h2 className='mb-2'>Εγγραφή</h2>
              <p className='text-gray-700 font-sans'>
                Δημιουργία νέου λογαριασμού με λίγα μόνο βήματα
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className='flex justify-center'>
          <div className='xl:w-2/5 w-full max-w-2xl'>
            <div className='relative bg-white p-12 sm:p-8 rounded-xl shadow-lg border border-gray-300'>
              <div className='mb-8'>
                <HeadingFormRegister />
                <p className='text-gray-600 mt-5'>
                  Έχεις ήδη λογαριασμό?{' '}
                  <LinkNP
                    href='/login'
                    className='text-green-600 hover:text-green-700 font-medium'
                  >
                    Σύνδεση!
                  </LinkNP>
                </p>
              </div>
              <AuthTypeOptions />
              <FormAuthRegister />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
