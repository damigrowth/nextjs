import React from 'react';
import Image from 'next/image';
import LinkNP from '@/components/link';

import { getImage } from '@/utils/image';
import { getMediaType } from '@/utils/media-validation';

import VideoPreview from './card-video-preview';

export default function ServiceCardFile({
  file,
  path,
  width,
  height,
  fallback,
}) {
  const fallbackImage =
    fallback ||
    'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750076750/Static/service_ngrppj.webp';

  if (!file) {
    return (
      <LinkNP href={path}>
        <div className='list-thumb flex-shrink-0 height'>
          <Image
            height={height || 245}
            width={width || 329}
            className='w-100 h-100 object-fit-cover'
            src={fallbackImage}
            alt='service-thumbnail'
          />
        </div>
      </LinkNP>
    );
  } else {
    // Check if the file is an image using MIME type
    const mediaType = getMediaType(file.mime);
    
    if (mediaType === 'image') {
      // Create imageData structure that our utility expects
      const imageData = { data: { attributes: file } };
      const imageUrl = getImage(imageData, { size: 'medium' }) || fallbackImage;

      return (
        <LinkNP href={path}>
          <div className='list-thumb flex-shrink-0 height'>
            <Image
              height={height || 245}
              width={width || 329}
              className='w-100 h-100 object-fit-cover'
              src={imageUrl}
              alt='service-thumbnail'
            />
          </div>
        </LinkNP>
      );
    } else if (mediaType === 'video') {
      // Render VideoPreview for video files
      return (
        <div className='list-thumb flex-shrink-0 height'>
          <div
            style={{
              width: width ? `${width}px` : '100%',
              height: height ? `${height}px` : '100%',
            }}
          >
            <VideoPreview
              previewUrl={file.previewUrl}
              videoUrl={file.url}
              mime={file.mime}
            />
          </div>
        </div>
      );
    } else {
      // For audio files or unknown types, render fallback image
      return (
        <LinkNP href={path}>
          <div className='list-thumb flex-shrink-0 height'>
            <Image
              height={height || 245}
              width={width || 329}
              className='w-100 h-100 object-fit-cover'
              src={fallbackImage}
              alt='service-thumbnail'
            />
          </div>
        </LinkNP>
      );
    }
  }
}
