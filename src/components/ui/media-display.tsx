'use client';

import React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
}

interface MediaDisplayProps {
  media: MediaItem[];
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
  if (!media || media.length === 0) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${
          aspectRatio === 'square'
            ? 'aspect-square'
            : aspectRatio === 'portrait'
            ? 'aspect-[3/4]'
            : 'aspect-video'
        } ${className}`}
      >
        <span className="text-gray-400">No media</span>
      </div>
    );
  }

  if (media.length === 1) {
    const item = media[0];
    
    if (item.type === 'image') {
      return (
        <div className={`relative overflow-hidden ${className}`}>
          <Image
            src={item.url}
            alt={item.alt || 'Service media'}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      );
    }

    if (item.type === 'video') {
      return (
        <div className={`relative ${className}`}>
          <video
            src={item.url}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Carousel className="w-full h-full">
        <CarouselContent>
          {media.map((item) => (
            <CarouselItem key={item.id}>
              <div className="relative w-full h-full">
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.alt || 'Service media'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showControls && media.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
          </>
        )}
      </Carousel>
    </div>
  );
}