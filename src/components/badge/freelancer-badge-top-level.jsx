import React from 'react';
import Image from 'next/image';

import { TooltipTop } from '../tooltip';

export default function TopLevelBadge({ topLevel }) {
  if (!topLevel) return null;

  return (
    <div id='top-level' className='tooltip-container'>
      <div className='top-badge-inline mb-0'>
        <Image
          width={22}
          height={22}
          src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750076624/Static/top-badge_rajlxi.webp'
          alt='top badge'
        />
      </div>
      <TooltipTop anchor='top-level'>
        Έχει λάβει εξαιρετικές αξιολογήσεις
      </TooltipTop>
    </div>
  );
}
