import React from 'react';
import { TooltipTop } from '../tooltip';

export default function VerifiedBadge({ verified }) {
  if (verified === undefined || verified === null || verified === false)
    return null;

  return (
    <div id='verified'>
      <p className='mb-0'>
        <i className='flaticon-success fa-xl text-thm vam'></i>
      </p>
      <TooltipTop anchor='verified'>Πιστοποιημένο Προφίλ</TooltipTop>
    </div>
  );
}
