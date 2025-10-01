import { Skeleton } from '@/components/ui/skeleton';

export default function CreateServiceLoading() {
  return (
    <div className="max-w-5xl w-full mx-auto space-y-6 p-2 pr-0">
      {/* Progress Header */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-between mt-6 space-x-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex-1 flex items-center space-x-2 p-2 rounded-lg bg-muted border-2 border-border"
            >
              <Skeleton className="w-5 h-5 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="space-y-6">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}
