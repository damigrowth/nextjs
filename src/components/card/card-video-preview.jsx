'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * @param {object} props - The component props.
 * @param {string} props.previewUrl - The URL for the preview image (can be static or GIF).
 * @param {string} props.videoUrl - The URL for the video file.
 * @param {string} props.mime - The MIME type of the video file.
 * @returns {JSX.Element} The optimized VideoPreview component.
 */
export default function VideoPreview({ previewUrl, videoUrl, mime }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const gifRef = useRef(null);
  const staticGifRef = useRef(null);

  // Maintain hover functionality for GIF switching
  useEffect(() => {
    const gifElement = gifRef.current;
    const staticGifElement = staticGifRef.current;

    if (!gifElement || !staticGifElement) return;

    if (isHovered) {
      gifElement.style.display = 'block';
      staticGifElement.style.display = 'none';
    } else {
      gifElement.style.display = 'none';
      staticGifElement.style.display = 'block';
    }
  }, [isHovered, previewUrl]);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    setIsPlaying(true);
  };

  // Fallback rendering if no preview URL is provided
  if (!previewUrl) {
    return (
      <div className='w-100 h-100 d-flex align-items-center justify-content-center bg-black'>
        <video controls className='mw-100 mh-100'>
          <source src={videoUrl} type={mime} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div
      className='video-preview-container'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isPlaying ? (
        <>
          {/* Static image - displayed by default */}
          <div
            ref={staticGifRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          >
            <Image
              src={previewUrl}
              alt='Video preview static'
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              style={{ objectFit: 'cover' }}
              priority={false}
              unoptimized={true}
            />
          </div>

          {/* Animated GIF - displayed on hover */}
          <div
            ref={gifRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'none',
            }}
          >
            <Image
              src={previewUrl}
              alt='Video preview'
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              style={{ objectFit: 'cover' }}
              priority={false}
              unoptimized={true}
            />
          </div>

          {/* Optimized play button overlay - CSS-only icon */}
          <div className='play-button-overlay' onClick={handlePlayClick}>
            <div className='play-icon'></div>
          </div>
        </>
      ) : (
        <div className='w-100 h-100 d-flex align-items-center justify-content-center'>
          <video controls autoPlay className='mw-100 mh-100'>
            <source src={videoUrl} type={mime} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
