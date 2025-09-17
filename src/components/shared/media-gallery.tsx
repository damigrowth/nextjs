import React from 'react';
import { AudioGallery, MediaCarousel } from '@/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MediaGalleryProps {
  media: PrismaJson.CloudinaryResource[] | null;
  title?: string;
  showCards?: boolean;
  className?: string;
}

export default function MediaGallery({
  media,
  title = 'Γκαλερί',
  showCards = true,
  className,
}: MediaGalleryProps) {
  if (!media || !Array.isArray(media) || media.length === 0) {
    return null;
  }

  // Separate audio files from visual media
  const audioFiles = media.filter((item) => item.resource_type === 'audio');
  const visualMedia = media.filter((item) => item.resource_type !== 'audio');

  return (
    <section className={`space-y-8 ${className || ''}`}>
      {/* Audio Gallery */}
      <AudioGallery audioFiles={audioFiles} />

      {/* Visual Media Carousel */}
      {visualMedia.length > 0 &&
        (showCards ? (
          <Card>
            <CardHeader className='pb-4'>
              <CardTitle className='text-lg font-semibold'>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaCarousel media={visualMedia} className='w-full' />
            </CardContent>
          </Card>
        ) : (
          <div>
            <MediaCarousel media={visualMedia} className='w-full' />
          </div>
        ))}
    </section>
  );
}
