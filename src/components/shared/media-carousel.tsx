'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, Music, FileVideo, FileImage } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import type { CloudinaryResource } from '@/lib/types/cloudinary';

interface MediaCarouselProps {
  media: CloudinaryResource[];
  className?: string;
}

export default function MediaCarousel({ media, className }: MediaCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      const newIndex = api.selectedScrollSnap();
      setCurrent(newIndex);
      // Pause video/audio when changing slides
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    });
  }, [api]);

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  const togglePlayPause = () => {
    const currentMedia = media[current];
    
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

  const getMediaIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'video':
        return <FileVideo className="h-3 w-3" />;
      case 'audio':
        return <Music className="h-3 w-3" />;
      case 'image':
      default:
        return <FileImage className="h-3 w-3" />;
    }
  };

  const getValidUrl = (item: CloudinaryResource): string | null => {
    const url = item.secure_url || item.url;
    return url && url.trim() !== '' ? url : null;
  };

  const renderMediaContent = (item: CloudinaryResource, index: number) => {
    const mediaUrl = getValidUrl(item);
    
    switch (item.resource_type) {
      case 'video':
        if (!mediaUrl) {
          return (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <p className="text-gray-500">Video unavailable</p>
            </div>
          );
        }
        return (
          <div className="relative h-full w-full">
            <video
              ref={index === current ? videoRef : null}
              src={mediaUrl}
              className="h-full w-full object-contain"
              controls={false}
              onEnded={() => setIsPlaying(false)}
              muted={isMuted}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 backdrop-blur-sm">
              <button
                onClick={togglePlayPause}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleMute}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        );

      case 'audio':
        if (!mediaUrl) {
          return (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <p className="text-gray-500">Audio unavailable</p>
            </div>
          );
        }
        return (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 p-8">
            <div className="mb-8 rounded-full bg-white/10 p-8 backdrop-blur-sm">
              <Music className="h-24 w-24 text-white" />
            </div>
            <audio
              ref={index === current ? audioRef : null}
              src={mediaUrl}
              className="hidden"
              onEnded={() => setIsPlaying(false)}
              muted={isMuted}
            />
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-center text-lg font-medium text-white">
                {item.original_filename || 'Audio File'}
              </h3>
              <div className="flex items-center gap-2 rounded-full bg-black/50 px-6 py-3 backdrop-blur-sm">
                <button
                  onClick={togglePlayPause}
                  className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        );

      case 'image':
      default:
        if (!mediaUrl) {
          return (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <p className="text-gray-500">Image unavailable</p>
            </div>
          );
        }
        return (
          <div className="relative h-full w-full">
            <Image
              src={mediaUrl}
              alt={item.original_filename || 'Portfolio image'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index === 0}
            />
          </div>
        );
    }
  };

  const getThumbnailContent = (item: CloudinaryResource) => {
    const mediaUrl = getValidUrl(item);

    if (item.resource_type === 'audio') {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-600">
          <Music className="h-6 w-6 text-white/80" />
        </div>
      );
    }

    if (item.resource_type === 'video') {
      if (!mediaUrl) {
        return (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <FileVideo className="h-6 w-6 text-gray-500" />
          </div>
        );
      }
      return (
        <>
          <video
            className="h-full w-full object-cover"
            preload="metadata"
            playsInline
            muted
          >
            <source
              src={mediaUrl}
              type={item.format ? `video/${item.format}` : 'video/mp4'}
            />
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="h-6 w-6 text-white drop-shadow-lg" />
          </div>
        </>
      );
    }

    if (!mediaUrl) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-200">
          <FileImage className="h-6 w-6 text-gray-500" />
        </div>
      );
    }

    return (
      <Image
        src={mediaUrl}
        alt={item.original_filename || 'Image thumbnail'}
        fill
        className="object-cover"
        sizes="80px"
      />
    );
  };

  if (!media || media.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
        <p className="text-gray-500">No media available</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Main Carousel */}
      <div className="relative">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {media.map((item, index) => (
              <CarouselItem key={`${item.public_id}-${index}`}>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                  {renderMediaContent(item, index)}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {media.length > 1 && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>

      </div>

      {/* Thumbnail Navigation */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-2 px-1">
          {media.map((item, index) => (
            <button
              key={`thumb-${item.public_id}-${index}`}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all',
                current === index
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 opacity-70 hover:opacity-100'
              )}
              aria-label={`Go to media ${index + 1}`}
            >
              {getThumbnailContent(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}