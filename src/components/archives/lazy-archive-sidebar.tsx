'use client';

import { lazy, Suspense } from 'react';
import type { ComponentProps } from 'react';

// Lazy load the sidebar component
const ArchiveSidebar = lazy(() =>
  import('./archive-sidebar').then(module => ({
    default: module.ArchiveSidebar
  }))
);

type ArchiveSidebarProps = ComponentProps<typeof ArchiveSidebar>;

// Loading fallback component
function SidebarSkeleton() {
  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-lg z-50 lg:relative lg:inset-0 lg:w-full">
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="mt-6 flex gap-3">
          <div className="h-10 bg-gray-200 rounded animate-pulse flex-1" />
          <div className="h-10 bg-gray-200 rounded animate-pulse flex-1" />
        </div>
      </div>
    </div>
  );
}

// Lazy wrapper component
export function LazyArchiveSidebar(props: ArchiveSidebarProps) {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <ArchiveSidebar {...props} />
    </Suspense>
  );
}