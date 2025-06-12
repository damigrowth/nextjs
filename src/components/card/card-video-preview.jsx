'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { IconPlay } from '@/components/icon/fa';

/**
 * Renders a video preview component.
 * Displays a preview image (static or animated GIF on hover) with a play button overlay.
 * Clicking the overlay replaces the preview with an HTML5 video player.
 * Handles cases where a preview URL might be missing.
 *
 * @param {object} props - The component props.
 * @param {string} props.previewUrl - The URL for the preview image (can be static or GIF).
 * @param {string} props.videoUrl - The URL for the video file.
 * @param {string} props.mime - The MIME type of the video file.
 * @returns {JSX.Element} The VideoPreview component.
 */
export default function VideoPreview({ previewUrl, videoUrl, mime }) {
  /**
   * State to track whether the video is currently playing.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * State to track whether the mouse cursor is hovering over the component.
   * Used to switch between static and animated preview images.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Ref for the animated GIF preview image element.
   * @type {React.RefObject<HTMLDivElement>}
   */
  const gifRef = useRef(null);

  /**
   * Ref for the static preview image element.
   * @type {React.RefObject<HTMLDivElement>}
   */
  const staticGifRef = useRef(null);

  /**
   * Effect to toggle the display of static and animated preview images based on hover state.
   * Shows the animated GIF when hovered, otherwise shows the static image.
   */
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
  }, [isHovered, previewUrl]); // Dependency array includes isHovered and previewUrl

  /**
   * Handles the click event on the play button overlay.
   * Sets the state to start video playback.
   * @param {React.MouseEvent} e - The click event object.
   */
  const handlePlayClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
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
      className='w-100 h-100 overflow-hidden bg-black'
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isPlaying ? (
        <>
          <div
            ref={staticGifRef}
            className='position-absolute top-0 start-0 w-100 h-100'
            style={{ display: 'block' }}
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
          <div
            ref={gifRef}
            className='position-absolute top-0 start-0 w-100 h-100'
            style={{ display: 'none' }}
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
          <div
            className='position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-100'
            onClick={handlePlayClick}
          >
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <IconPlay
                style={{
                  fontSize: '28px',
                  color: 'white',
                }}
              />
            </div>
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
