import React from 'react';
import { IconCheckCircle } from '@/components/icon/fa';

import { TooltipTop } from '../tooltip';

export default function VerifiedBadge({ verified }) {
  if (verified === undefined || verified === null || verified === false)
    return null;

  return (
    <div id='verified'>
      <p className='mb-0'>
        <IconCheckCircle size='xl' className='text-thm vam' />
      </p>
      <TooltipTop anchor='verified'>Πιστοποιημένο Προφίλ</TooltipTop>
    </div>
  );
}
