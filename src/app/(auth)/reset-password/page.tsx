import { JSX } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Meta } from '@/lib/seo/Meta';
import { FormResetPassword } from '@/components/auth';
import {
  redirectCompletedUsers,
  redirectOnboardingUsers,
} from '@/actions/auth/server';

export const dynamic = 'force-dynamic';

// Static SEO
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await Meta({
    titleTemplate: 'Επαναφορά Κωδικού - Doulitsa',
    descriptionTemplate:
      'Δημιούργησε νέο κωδικό πρόσβασης για τον λογαριασμό σου στην Doulitsa.',
    size: 160,
    url: '/reset-password',
  });

  return meta;
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps): Promise<JSX.Element> {
  // Server-side auth check - redirect authenticated users to their dashboard
  await redirectCompletedUsers();

  // Server-side auth check - redirect ONBOARDING users to /onboarding
  await redirectOnboardingUsers();

  // Get token from search params
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : null;

  // If no token, redirect to forgot password page
  if (!token) {
    redirect('/forgot-password');
  }

  return (
    <section className='py-16 bg-gray-50 min-h-screen'>
      <div className='container mx-auto px-4'>
        {/* Title Section */}
        <div className='flex justify-center mb-15'>
          <div className='lg:w-1/2 text-center'>
            <div className='relative mb-15 lg:mb-8'>
              <h2 className='text-2xl lg:text-3xl font-medium text-gray-900 mb-2'>
                Επαναφορά Κωδικού
              </h2>
              <p className='text-gray-700 font-sans'>
                Δημιούργησε έναν νέο, ασφαλή κωδικό για τον λογαριασμό σου.
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
                  Δημιουργία νέου κωδικού
                </h4>
                <p className='text-gray-600'>
                  Εισήγαγε έναν νέο, ασφαλή κωδικό για τον λογαριασμό σου.
                </p>
              </div>
              <FormResetPassword token={token} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}