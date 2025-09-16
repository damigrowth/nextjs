'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface MediaDisplayProps {
  media: PrismaJson.Media;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  showControls?: boolean;
}

export default function MediaDisplay({
  media,
  className = '',
  aspectRatio = 'video',
  showControls = true,
}: MediaDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const getValidUrl = (item: PrismaJson.CloudinaryResource): string | null => {
    const url = item.secure_url || item.url;
    return url && url.trim() !== '' ? url : null;
  };

  const togglePlayPause = () => {
    if (media.length === 0) return;

    const currentMedia = media[0];

    if (currentMedia.resource_type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (currentMedia.resource_type === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
    setIsMuted(!isMuted);
  };

  const renderMediaContent = (item: PrismaJson.CloudinaryResource) => {
    const mediaUrl = getValidUrl(item);

    if (!mediaUrl) {
      return (
        <div className='flex h-full w-full items-center justify-center bg-gray-100'>
          <p className='text-gray-500'>Media unavailable</p>
        </div>
      );
    }

    switch (item.resource_type) {
      case 'video':
        return (
          <div className='relative h-full w-full'>
            <video
              ref={videoRef}
              src={mediaUrl}
              className='h-full w-full object-cover'
              controls={false}
              onEnded={() => setIsPlaying(false)}
              muted={isMuted}
              preload='metadata'
            >
              Your browser does not support the video tag.
            </video>
            {showControls && (
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 backdrop-blur-sm'>
                <button
                  onClick={togglePlayPause}
                  className='rounded-full p-2 text-white transition-colors hover:bg-white/20'
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className='h-4 w-4' />
                  ) : (
                    <Play className='h-4 w-4' />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  className='rounded-full p-2 text-white transition-colors hover:bg-white/20'
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className='h-4 w-4' />
                  ) : (
                    <Volume2 className='h-4 w-4' />
                  )}
                </button>
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className='flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700'>
            <div className='mb-4 rounded-full bg-white/10 p-4 backdrop-blur-sm'>
              <Music className='h-12 w-12 text-white' />
            </div>
            <audio
              ref={audioRef}
              src={mediaUrl}
              className='hidden'
              onEnded={() => setIsPlaying(false)}
              muted={isMuted}
            />
            <div className='flex flex-col items-center gap-2'>
              <h4 className='text-center text-sm font-medium text-white'>
                {item.original_filename || 'Audio File'}
              </h4>
              {showControls && (
                <div className='flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 backdrop-blur-sm'>
                  <button
                    onClick={togglePlayPause}
                    className='rounded-full p-2 text-white transition-colors hover:bg-white/20'
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className='h-4 w-4' />
                    ) : (
                      <Play className='h-4 w-4' />
                    )}
                  </button>
                  <button
                    onClick={toggleMute}
                    className='rounded-full p-2 text-white transition-colors hover:bg-white/20'
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className='h-4 w-4' />
                    ) : (
                      <Volume2 className='h-4 w-4' />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'image':
      default:
        return (
          <div className='relative h-full w-full'>
            <Image
              src={mediaUrl}
              alt={item.original_filename || 'Service media'}
              fill
              className='object-cover'
              sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            />
          </div>
        );
    }
  };

  if (!media || media.length === 0) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center h-full w-full ${className}`}
      >
        <span className='text-gray-500'>No media available</span>
      </div>
    );
  }

  if (media.length === 1) {
    const item = media[0];

    return (
      <div className={`relative overflow-hidden h-full w-full ${className}`}>
        {renderMediaContent(item)}
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <Carousel className='w-full h-full'>
        <CarouselContent className='h-full'>
          {media.map((item, index) => (
            <CarouselItem key={`${item.public_id}-${index}`} className='h-full'>
              <div className='relative w-full h-full'>
                {renderMediaContent(item)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showControls && media.length > 1 && (
          <>
            <CarouselPrevious className='absolute left-2 top-1/2 -translate-y-1/2' />
            <CarouselNext className='absolute right-2 top-1/2 -translate-y-1/2' />
          </>
        )}
      </Carousel>
    </div>
  );
}
