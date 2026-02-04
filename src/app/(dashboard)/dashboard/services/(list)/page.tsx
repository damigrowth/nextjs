import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ServiceTable from '@/components/dashboard/services/service-table';
import ServiceTableFilters from '@/components/dashboard/services/service-table-filters';
import ServicePagination from '@/components/dashboard/services/service-pagination';
import {
  getUserServices,
  getUserServiceStats,
} from '@/actions/services/get-user-services';
import { Status } from '@prisma/client';
import { StatusColors, StatusLabels } from '@/lib/types/common';
import type {
  UserServiceFilterOptions,
  ServiceSortField,
  SortOrder,
} from '@/lib/types/services';
import { getDashboardMetadata } from '@/lib/seo/pages';
import { NextLink } from '@/components';

export const metadata = getDashboardMetadata('Διαχείριση Υπηρεσιών');

interface ServicesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  // Await searchParams first
  const params = await searchParams;

  // Parse search params for filters
  const filters: UserServiceFilterOptions = {
    page: parseInt(params.page || '1'),
    limit: parseInt(params.limit || '12'),
    status: params.status || 'all',
    search: params.search || '',
    sortBy: (params.sortBy as ServiceSortField) || 'updatedAt',
    sortOrder: (params.sortOrder as SortOrder) || 'desc',
  };

  // Fetch data server-side
  const [servicesResult, statsResult] = await Promise.all([
    getUserServices(filters),
    getUserServiceStats(),
  ]);

  // Handle errors
  if (!servicesResult.success) {
    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Διαχείριση Υπηρεσιών
            </h1>
          </div>
          <Button asChild>
            <NextLink href='/dashboard/services/create'>
              <Plus className='w-4 h-4 mr-2' />
              Νέα Υπηρεσία
            </NextLink>
          </Button>
        </div>

        <Card>
          <CardContent className='p-6'>
            <div className='text-center py-8'>
              <p className='text-red-600'>{servicesResult.error}</p>
              <p className='text-gray-500 mt-2'>
                Παρακαλώ ανανεώστε τη σελίδα ή δοκιμάστε ξανά αργότερα.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const services = servicesResult.data;
  const stats = statsResult.success ? statsResult.data : null;

  // Status stats for display
  const statusStats = [
    { status: Status.published, count: stats?.published || 0 },
    { status: Status.pending, count: stats?.pending || 0 },
    { status: Status.draft, count: stats?.draft || 0 },
    { status: Status.rejected, count: stats?.rejected || 0 },
  ];

  return (
    <div className='space-y-6 p-2 pr-0'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Διαχείριση Υπηρεσιών
          </h1>
          {stats?.pending > 0 && (
            <p className='text-gray-600 mt-1'>
              Υπάρχουν{' '}
              <span className='font-semibold text-yellow-600'>
                {stats.pending}
              </span>{' '}
              υπηρεσίες σε αναμονή για έγκριση.
            </p>
          )}
        </div>
        <Button asChild>
          <NextLink href='/dashboard/services/create'>
            <Plus className='w-4 h-4 mr-2' />
            Νέα Υπηρεσία
          </NextLink>
        </Button>
      </div>

      {/* Services Table */}
      <Card>
        <CardContent className='p-6'>
          {/* Table Header with Stats */}
          <div className='space-y-4 mb-6'>
            {/* Title and Stats Row */}
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Υπηρεσίες
                <span className='text-sm font-normal text-gray-600 ml-2'>
                  ({services.total})
                </span>
              </h2>

              {/* Status Indicators */}
              <div className='flex items-center gap-4'>
                {statusStats.map((stat) => (
                  <div key={stat.status} className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${StatusColors[stat.status].dot}`}
                    />
                    <span className='text-sm text-gray-600'>
                      {StatusLabels[stat.status]}
                    </span>
                    <span className='text-sm font-medium text-gray-900'>
                      {stat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search and Sort Filters */}
            <div className='border-t pt-4'>
              <ServiceTableFilters currentFilters={filters} />
            </div>
          </div>
          <ServiceTable
            services={services.services}
            currentSort={{
              field: filters.sortBy || 'updatedAt',
              order: filters.sortOrder || 'desc',
            }}
            canFeatureMore={services.canFeatureMore}
          />

          {/* Pagination */}
          {services.totalPages > 1 && (
            <div className='mt-6'>
              <ServicePagination
                currentPage={services.page}
                totalPages={services.totalPages}
                currentLimit={filters.limit || 12}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
