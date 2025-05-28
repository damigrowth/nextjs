'use client';

import React from 'react';
import FsLightbox from 'fslightbox-react';

import useArchiveStore from '@/stores/archive/archiveStore';

export default function BannerVidBox() {
  const { bannerVideoToggled } = useArchiveStore();

  return (
    <FsLightbox
      toggler={bannerVideoToggled}
      sources={['https://www.youtube.com/watch?v=7EHnQ0VM4KY']}
    />
  );
}
