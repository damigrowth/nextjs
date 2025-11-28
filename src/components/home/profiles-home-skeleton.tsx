import { Skeleton } from '@/components/ui/skeleton';

export function ProfilesHomeSkeleton() {
  return (
    <section className='py-8 sm:py-12 md:py-16 bg-dark overflow-hidden'>
      <div className='container mx-auto px-4 sm:px-6'>
        {/* Header Section Skeleton */}
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-12'>
          {/* Left Side - Title & Description Skeleton */}
          <div className='flex-1 lg:max-w-2xl space-y-2'>
            <Skeleton className='h-8 w-80 bg-gray-700' />
            <Skeleton className='h-5 w-96 bg-gray-700' />
          </div>

          {/* Right Side - View All Button Skeleton */}
          <Skeleton className='h-10 w-48 bg-gray-700' />
        </div>

        {/* Profiles Carousel Skeleton */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
              {/* Avatar Skeleton */}
              <div className='flex flex-col items-center text-center'>
                <Skeleton className='h-20 w-20 rounded-2xl mb-4' />

                {/* Name Skeleton */}
                <Skeleton className='h-6 w-32 mb-1' />

                {/* Subcategory Skeleton */}
                <Skeleton className='h-4 w-24 mb-3' />

                {/* Rating Skeleton */}
                <Skeleton className='h-4 w-28' />

                {/* Speciality Badge Skeleton */}
                <Skeleton className='h-6 w-20 mt-3 mb-1 rounded-full' />

                {/* Button Skeleton */}
                <Skeleton className='h-10 w-full mt-4' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
