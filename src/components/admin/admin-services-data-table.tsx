'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Star, Globe, FileText, XCircle, Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils/date';
import { Status } from '@prisma/client';
import TableMedia from '@/components/shared/table-media';
import TaxonomiesDisplay from '@/components/shared/taxonomies-display';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { AdminDataTable, ColumnDef } from './admin-data-table';
import type { AdminServiceWithRelations } from '@/lib/types/services';

interface AdminServicesDataTableProps {
  data: AdminServiceWithRelations[];
  loading?: boolean;
  basePath?: string;
}

// Status badges component
function ServiceStatusBadges({
  status,
  featured,
}: {
  status: Status;
  featured: boolean;
}) {
  return (
    <div className='flex items-center gap-2'>
      {status === 'published' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Globe className='h-5 w-5 text-green-600 cursor-pointer' />
          </TooltipTrigger>
          <TooltipContent>
            <p>Published</p>
          </TooltipContent>
        </Tooltip>
      )}
      {status === 'draft' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <FileText className='h-5 w-5 text-gray-500 cursor-pointer' />
          </TooltipTrigger>
          <TooltipContent>
            <p>Draft</p>
          </TooltipContent>
        </Tooltip>
      )}
      {status === 'pending' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Clock className='h-5 w-5 text-yellow-600 cursor-pointer' />
          </TooltipTrigger>
          <TooltipContent>
            <p>Pending Approval</p>
          </TooltipContent>
        </Tooltip>
      )}
      {status === 'rejected' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <XCircle className='h-5 w-5 text-red-600 cursor-pointer' />
          </TooltipTrigger>
          <TooltipContent>
            <p>Rejected</p>
          </TooltipContent>
        </Tooltip>
      )}
      {featured && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Star className='h-5 w-5 text-yellow-500 fill-yellow-500 cursor-pointer' />
          </TooltipTrigger>
          <TooltipContent>
            <p>Featured</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function AdminServicesDataTable({
  data,
  loading = false,
  basePath = '/admin/services',
}: AdminServicesDataTableProps) {
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `${price}€`;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className='flex items-center gap-0.5'>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : i === fullStars && hasHalfStar
                  ? 'fill-yellow-200 text-yellow-400'
                  : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const columns: ColumnDef<AdminServiceWithRelations>[] = [
    {
      key: 'title',
      header: 'Service',
      sortable: true,
      className: 'max-w-[480px]',
      render: (service) => (
        <div className='flex items-center gap-3'>
          <TableMedia media={service.media || []} />
          <div className='flex-1 min-w-0'>
            <Link
              href={`/admin/services/${service.id}`}
              className='min-w-0'
            >
              <h3 className='text-sm font-medium text-gray-900 truncate hover:text-primary hover:underline cursor-pointer transition-colors'>
                {service.title}
              </h3>
            </Link>
            <p className='text-xs text-muted-foreground'>
              by{' '}
              <Link
                href={`/admin/profiles/${service.profile.id}`}
                className='hover:text-primary hover:underline transition-colors'
              >
                {service.profile.displayName || service.profile.user.email}
              </Link>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      className: 'max-w-[200px]',
      render: (service) =>
        service.taxonomyLabels ? (
          <TaxonomiesDisplay
            taxonomyLabels={service.taxonomyLabels}
            compact
          />
        ) : (
          <Badge variant='outline' className='text-xs w-fit'>
            {service.category}
          </Badge>
        ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (service) => (
        <div className='font-medium'>{formatPrice(service.price)}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (service) => (
        <ServiceStatusBadges
          status={service.status as Status}
          featured={service.featured}
        />
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (service) => (
        <div className='flex flex-col gap-1'>
          {renderStars(service.rating)}
          <span className='text-xs text-muted-foreground'>
            {service.rating.toFixed(1)} ({service._count.reviews} reviews)
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (service) => (
        <div className='text-sm text-muted-foreground'>
          <div>{formatDate(new Date(service.createdAt))}</div>
          <div className='text-xs'>{formatTime(new Date(service.createdAt))}</div>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (service) => (
        <div className='text-sm text-muted-foreground'>
          <div>{formatDate(new Date(service.updatedAt))}</div>
          <div className='text-xs'>{formatTime(new Date(service.updatedAt))}</div>
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      data={data}
      columns={columns}
      loading={loading}
      basePath={basePath}
      editPath={(service) => `${basePath}/${service.id}`}
      emptyMessage='No services found matching your criteria.'
      skeletonRows={5}
    />
  );
}
