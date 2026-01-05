import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader for ProfileIndustries component
 * Matches the card with title and industry badges
 */
export default function ProfileIndustriesSkeleton() {
  return (
    <section>
      <Card className='rounded-lg border border-border'>
        <CardHeader className='pb-4'>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            <Skeleton className='h-8 w-24 rounded-xl' />
            <Skeleton className='h-8 w-28 rounded-xl' />
            <Skeleton className='h-8 w-32 rounded-xl' />
            <Skeleton className='h-8 w-20 rounded-xl' />
            <Skeleton className='h-8 w-26 rounded-xl' />
            <Skeleton className='h-8 w-22 rounded-xl' />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
