import React from 'react';
import { VerificationManagement } from '@/components/admin/verification-management';

export const dynamic = 'force-dynamic';

export default function AdminVerificationsPage() {
  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='px-4 lg:px-6'>
        <VerificationManagement />
      </div>
    </div>
  );
}
