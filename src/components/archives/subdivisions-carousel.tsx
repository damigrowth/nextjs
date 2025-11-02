import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { SubdivisionWithCount } from '@/actions/services/get-categories';

interface SubdivisionsCarouselProps {
  subdivisions: SubdivisionWithCount[];
  hideTitle?: boolean;
}

export function SubdivisionsCarousel({
  subdivisions,
  hideTitle = false,
}: SubdivisionsCarouselProps) {
  if (subdivisions.length === 0) {
    return null;
  }

  return (
    <section>
      {!hideTitle && (
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Πιο δημοφιλείς εργασίες
          </h2>
        </div>
      )}

      <div className='relative'>
        <Carousel
          opts={{
            align: 'start',
            slidesToScroll: 1,
          }}
          className='w-full'
        >
          <CarouselContent className='-ml-2 md:-ml-4'>
            {subdivisions.map((subdivision) => (
              <CarouselItem
                key={subdivision.id}
                className='pl-2 md:pl-4 basis-auto'
              >
                <Link href={subdivision.href}>
                  <Badge
                    variant='outline'
                    className='text-sm px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer whitespace-nowrap bg-white'
                  >
                    {subdivision.label}
                    {/* <span className='ml-2 text-xs opacity-70'>
                      ({subdivision.count})
                    </span> */}
                  </Badge>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className='hidden md:flex' />
          <CarouselNext className='hidden md:flex' />
        </Carousel>
        <div className='absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none' />
      </div>
    </section>
  );
}
