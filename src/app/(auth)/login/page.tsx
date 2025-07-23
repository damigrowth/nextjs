import { Metadata } from 'next';
import LinkNP from '@/components/link';

import { Meta } from '@/lib/seo/Meta';
import {
  redirectOnboardingUsers,
  redirectCompletedUsers,
} from '@/actions/shared/auth';
import { LoginForm } from '@/components/forms';

export const dynamic = 'force-dynamic';

// Static SEO
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await Meta({
    titleTemplate: 'Είσοδος - Doulitsa',
    descriptionTemplate:
      'Συνδέσου στον λογαριασμό σου για να αποκτήσεις πρόσβαση στις υπηρεσίες της Doulitsa.',
    size: 160,
    url: '/login',
  });

  return meta;
}

export default async function LoginPage(): Promise<JSX.Element> {
  // Server-side auth check - redirect authenticated users to their dashboard
  await redirectCompletedUsers();

  // Server-side auth check - redirect ONBOARDING users to /onboarding
  await redirectOnboardingUsers();

  const isUnderMaintenance = false;

  return (
    <section className='py-16 bg-gray-50 min-h-screen'>
      <div className='container mx-auto px-4'>
        {/* Title Section */}
        <div className='flex justify-center mb-15'>
          <div className='lg:w-1/2 text-center'>
            <div className='relative mb-15 lg:mb-8'>
              <h2 className='text-2xl lg:text-3xl font-medium text-gray-900 mb-2'>
                Είσοδος
              </h2>
              <p className='text-gray-700 font-sans'>
                Κάνε σύνδεση ή εγγραφή με έναν από τους παρακάτω τρόπους.
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className='flex justify-center'>
          <div className='xl:w-1/2 w-full max-w-2xl'>
            <div className='relative bg-white p-12 sm:p-8 rounded-xl shadow-lg border border-gray-300'>
              <div className='mb-8'>
                <h4 className='text-xl font-semibold text-gray-900 mb-2'>
                  Συνδέσου στον λογαριασμό σου
                </h4>
                {!isUnderMaintenance && (
                  <p className='text-gray-600'>
                    Δεν έχεις λογαριασμό?{' '}
                    <LinkNP
                      href='/register'
                      className='text-green-600 hover:text-green-700 font-medium'
                    >
                      Εγγραφή!
                    </LinkNP>
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
