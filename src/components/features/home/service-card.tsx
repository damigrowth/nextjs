'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MediaDisplay from '@/components/ui/media-display';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    category: string;
    slug: string;
    price?: number;
    rating: number;
    reviewCount: number;
    media: Array<{
      id: string;
      url: string;
      type: 'image' | 'video';
      alt?: string;
    }>;
    profile: {
      id: string;
      displayName: string;
      username: string;
      avatar?: string;
    };
  };
  onSave?: (serviceId: string) => void;
  isSaved?: boolean;
}

export default function ServiceCard({
  service,
  onSave,
  isSaved = false,
}: ServiceCardProps) {
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.(service.id);
  };

  const truncateTitle = (title: string, maxLines: number = 3) => {
    const words = title.split(' ');
    // Rough estimation: ~8 words per line on average
    const maxWords = maxLines * 8;
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return title;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className='group cursor-pointer overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg bg-white'>
      <div className='relative'>
        {/* Media Section */}
        <div className='relative aspect-video bg-gray-100'>
          <MediaDisplay
            media={service.media}
            className='w-full h-full rounded-t-lg object-cover'
            aspectRatio='video'
            showControls={false}
          />

          {/* Save Button */}
          <Button
            variant='ghost'
            size='icon'
            className='absolute top-3 right-3 bg-white/90 hover:bg-white border border-gray-200 shadow-sm rounded-full h-8 w-8'
            onClick={handleSaveClick}
          >
            <Heart
              className={`h-4 w-4 ${
                isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </Button>
        </div>

        {/* Content Section */}
        <CardContent className='p-4 flex flex-col h-full'>
          {/* Category */}
          <p className='text-sm text-gray-600 mb-3 font-normal'>
            {service.category}
          </p>

          {/* Title - Truncated to 2 lines */}
          <h3 className='font-semibold text-[rgb(34,34,34)] mb-3 leading-tight text-base'>
            <Link
              href={`/services/${service.slug}`}
              className='hover:text-third transition-colors'
            >
              <span
                className='line-clamp-2'
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {service.title}
              </span>
            </Link>
          </h3>

          {/* Rating */}
          {service.reviewCount > 0 && (
            <div className='flex items-center gap-1 mb-4'>
              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
              <span className='text-[14px] font-medium text-[rgb(34,34,34)]'>
                {service.rating.toFixed(1)}
              </span>
              <span className='text-[14px] text-[rgb(34,34,34)]'>
                ({service.reviewCount}{' '}
                {service.reviewCount === 1 ? 'αξιολόγηση' : 'αξιολογήσεις'})
              </span>
            </div>
          )}

          {/* Separator Line */}
          <div className='border-t border-gray-200 pt-3 mt-auto'>
            {/* Profile and Price */}
            <div className='flex items-center gap-3'>
              {/* Profile Info */}
              <div className='flex items-center gap-2 flex-1'>
                <Avatar className='h-6 w-6'>
                  <AvatarImage
                    src={service.profile.avatar}
                    alt={service.profile.displayName}
                  />
                  <AvatarFallback className='text-xs bg-gray-100'>
                    {getInitials(service.profile.displayName)}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/profile/${service.profile.username}`}
                  className='text-sm text-gray-700 hover:text-third transition-colors font-medium'
                >
                  {service.profile.displayName}
                </Link>
              </div>

              {/* Price */}
              {service.price && service.price > 0 && (
                <div className='text-sm text-gray-700'>
                  <span className='font-normal'>από </span>
                  <span className='font-semibold'>{service.price}€</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
