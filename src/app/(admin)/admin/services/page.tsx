import React from 'react';
import { RefreshCw, Layers, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminServicesTable from '@/components/admin/admin-services-table';
import AdminServiceTableFilters from '@/components/admin/admin-service-table-filters';
import ServicePagination from '@/components/dashboard/services/service-pagination';
import {
  listServices,
  getServiceStats,
} from '@/actions/admin/services';
import { StatusColors } from '@/lib/types/common';
import type {
  AdminServiceSortField,
  SortOrder,
} from '@/components/admin/admin-service-table-header-sort';

interface ServicesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    search?: string;
    featured?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  // Await searchParams first
  const params = await searchParams;

  // Parse search params for filters
  const filters: any = {
    limit: parseInt(params.limit || '12'),
    offset: (parseInt(params.page || '1') - 1) * parseInt(params.limit || '12'),
    sortBy: (params.sortBy as AdminServiceSortField) || 'createdAt',
    sortDirection: (params.sortOrder as SortOrder) || 'desc',
  };

  if (params.search) filters.searchQuery = params.search;
  if (params.status && params.status !== 'all') filters.status = params.status;
  if (params.featured && params.featured !== 'all') filters.featured = params.featured;
  if (params.category && params.category !== 'all') filters.category = params.category;

  // Fetch data server-side
  const [servicesResult, statsResult] = await Promise.all([
    listServices(filters),
    getServiceStats(),
  ]);

  // Handle errors
  if (!servicesResult.success) {
    return (
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='px-4 lg:px-6'>
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>Services</h1>
                <p className='text-muted-foreground'>
                  Manage services, approvals, and featured listings
                </p>
              </div>
            </div>

            <Card>
              <CardContent className='p-6'>
                <div className='text-center py-8'>
                  <p className='text-red-600'>{servicesResult.error}</p>
                  <p className='text-gray-500 mt-2'>
                    Please refresh the page or try again later.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const services = servicesResult.data?.services || [];
  const total = servicesResult.data?.total || 0;
  const stats = statsResult.success ? statsResult.data : null;

  const currentPage = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '12');
  const totalPages = Math.ceil(total / limit);

  // Status stats for display
  const statusStats = [
    { status: 'published', count: stats?.published || 0, color: StatusColors.published.dot },
    { status: 'pending', count: stats?.pending || 0, color: StatusColors.pending.dot },
    { status: 'draft', count: stats?.draft || 0, color: StatusColors.draft.dot },
    { status: 'rejected', count: stats?.rejected || 0, color: StatusColors.rejected.dot },
  ];

  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='px-4 lg:px-6'>
        <div className='space-y-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Services</h1>
              <p className='text-muted-foreground'>
                Manage services, approvals, and featured listings
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Services
                </CardTitle>
                <Layers className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats?.total || 0}</div>
                <p className='text-xs text-muted-foreground'>
                  All services in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Published</CardTitle>
                <CheckCircle2 className='h-4 w-4 text-green-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats?.published || 0}</div>
                <p className='text-xs text-muted-foreground'>
                  {total > 0 ? ((stats?.published || 0) / total * 100).toFixed(0) : 0}% of
                  total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Pending Approval
                </CardTitle>
                <AlertCircle className='h-4 w-4 text-yellow-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats?.pending || 0}</div>
                <p className='text-xs text-muted-foreground'>
                  Awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Featured</CardTitle>
                <Star className='h-4 w-4 text-yellow-500' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats?.featured || 0}</div>
                <p className='text-xs text-muted-foreground'>Premium listings</p>
              </CardContent>
            </Card>
          </div>

          {/* Services Table */}
          <Card>
            <CardContent className='p-6'>
              {/* Table Header with Stats */}
              <div className='space-y-4 mb-6'>
                {/* Title and Stats Row */}
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-semibold text-gray-900'>
                    Services
                    <span className='text-sm font-normal text-gray-600 ml-2'>
                      ({total})
                    </span>
                  </h2>

                  {/* Status Indicators */}
                  <div className='flex items-center gap-4'>
                    {statusStats.map((stat) => (
                      <div key={stat.status} className='flex items-center gap-2'>
                        <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                        <span className='text-sm text-gray-600 capitalize'>
                          {stat.status}
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
                  <AdminServiceTableFilters
                    currentFilters={{
                      search: params.search,
                      status: params.status,
                      featured: params.featured,
                      category: params.category,
                    }}
                  />
                </div>
              </div>

              <AdminServicesTable
                services={services}
                currentSort={{
                  field: (params.sortBy as AdminServiceSortField) || 'createdAt',
                  order: (params.sortOrder as SortOrder) || 'desc',
                }}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mt-6'>
                  <ServicePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    currentLimit={limit}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
