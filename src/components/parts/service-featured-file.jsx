import React from 'react';
import Image from 'next/image';

import { getImage } from '@/utils/image';

import VideoPreview from '../card/card-video-preview';

export default function FeaturedFile({ file, formats }) {
  // Early exit if no file is provided
  if (!file || !file.attributes) {
    // Optionally render a fallback or null
    return null;
  }

  let image = null;

  const fileAttributes = file.attributes;

  // Create imageData structure that our utility expects
  const imageData = { data: { attributes: fileAttributes } };
  const imageUrl = getImage(imageData, { size: 'large' });
  
  if (imageUrl) {
    // Get the best image data including dimensions
    image = getImage(imageData, { size: 'large', returnType: 'full' });
  }
  // If the file is audio, render nothing
  if (fileAttributes.mime?.startsWith('audio/')) {
    return null;
  }

  // Otherwise, render the image or video player
  return (
    <>
      <div className='scrollbalance-inner'>
        {image ? (
          // If it's an image, keep the original structure (might be styled for single image sliders)
          <div className='service-single-image vam_nav_style slider-1-grid owl-carousel owl-theme mb60 owl-loaded owl-drag'>
            <div className='thumb p50 p30-sm'>
              <Image
                height={image.height}
                width={image.width}
                src={image.url}
                alt={`featured-image`}
                className='w-100 h-auto'
              />
            </div>
          </div>
        ) : fileAttributes.mime?.startsWith('video/') ? (
          // If it's a video, use a container with enforced aspect ratio
          <div className='thumb p50 p30-sm'>
            <div className='service-single-image vam_nav_style slider-1-grid owl-carousel owl-theme owl-loaded owl-drag ratio ratio-16x9 '>
              {' '}
              {/* Keep margin, add aspect ratio */}
              {/* Render VideoPreview directly inside, it should fill the ratio container */}
              {/* Remove thumb div as ratio div handles structure */}
              <VideoPreview
                previewUrl={fileAttributes.previewUrl}
                videoUrl={fileAttributes.url}
                mime={fileAttributes.mime}
              />
              {/* Removed closing thumb div */}
            </div>
          </div>
        ) : null}
        {/* Render nothing if it's not image, not audio, and not video */}
      </div>
    </>
  );
}
