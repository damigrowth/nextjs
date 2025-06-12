'use client';

import React from 'react';
import { IconPlay } from '@/components/icon/fa';

import useArchiveStore from '@/stores/archive/archiveStore';

export default function BannerVidBtn() {
  const { bannerVideoHandler } = useArchiveStore();

  return (
    <div className='d-flex align-items-center'>
      <a
        className='video-btn mr10 popup-iframe popup-youtube'
        onClick={bannerVideoHandler}
      >
        <IconPlay />
      </a>
      <h6 className='mb-0 text-white'>Πώς λειτουργεί</h6>
    </div>
  );
}
