import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GitBranch, FileText } from 'lucide-react';

export function DeploymentSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Current Branch Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <GitBranch className='h-5 w-5' />
            Current Branch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-8 w-48' />
        </CardContent>
      </Card>

      {/* Pending Changes Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Pending Changes
          </CardTitle>
          <CardDescription>Review your uncommitted taxonomy updates</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-12 w-full' />
          <Skeleton className='h-12 w-full' />
          <Skeleton className='h-40 w-full' />
        </CardContent>
      </Card>

      {/* Commit Form Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-48' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-10 w-full' />
        </CardContent>
      </Card>
    </div>
  );
}
