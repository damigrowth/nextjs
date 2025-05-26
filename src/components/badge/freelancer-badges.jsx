import React from 'react';

import TopLevelBadge from './freelancer-badge-top-level';
import VerifiedBadge from './freelancer-badge-verified';

export default function Badges({ verified, topLevel }) {
  return (
    <div className='badges'>
      <VerifiedBadge verified={verified} />
      <TopLevelBadge topLevel={topLevel} />
    </div>
  );
}
