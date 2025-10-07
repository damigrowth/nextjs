'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';
import { Status } from '@prisma/client';
import ServiceStatusBadge from '@/components/dashboard/services/service-status-badge';
import TableMedia from '@/components/shared/table-media';
import TaxonomiesDisplay from '@/components/shared/taxonomies-display';
import AdminServiceTableHeaderSort from './admin-service-table-header-sort';
import type {
  AdminServiceSortField,
  SortOrder,
} from './admin-service-table-header-sort';
import type { AdminServiceWithRelations } from '@/lib/types/services';

interface AdminServicesTableProps {
  services: AdminServiceWithRelations[];
  currentSort: {
    field: AdminServiceSortField;
    order: SortOrder;
  };
  className?: string;
}

export default function AdminServicesTable({
  services,
  currentSort,
  className,
}: AdminServicesTableProps) {
  // Helper functions
  const formatPrice = (price: number | null, fixed: boolean) => {
    if (price === null) return 'N/A';
    return fixed ? `€${price}` : `From €${price}`;
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

  // Empty state
  if (services.length === 0) {
    return (
      <div className={cn('rounded-md border', className)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[30%] text-base font-semibold'>
                Service
              </TableHead>
              <TableHead className='w-[15%] text-base font-semibold'>
                Category
              </TableHead>
              <TableHead className='w-[10%] text-base font-semibold'>
                Price
              </TableHead>
              <TableHead className='w-[10%] text-base font-semibold'>
                Status
              </TableHead>
              <TableHead className='w-[10%] text-base font-semibold'>
                Rating
              </TableHead>
              <TableHead className='w-[15%] text-base font-semibold'>
                Created
              </TableHead>
              <TableHead className='w-[10%]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className='h-32 text-center'>
                <div className='flex flex-col items-center justify-center space-y-3'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
                    <Edit className='w-8 h-8 text-gray-400' />
                  </div>
                  <div className='space-y-1'>
                    <h3 className='font-medium text-gray-900'>
                      No services found
                    </h3>
                    <p className='text-sm text-gray-500'>
                      No services match your current filters
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <AdminServiceTableHeaderSort
              field='title'
              currentSort={currentSort}
              className='w-[30%] text-base font-semibold'
            >
              Service
            </AdminServiceTableHeaderSort>
            <AdminServiceTableHeaderSort
              field='category'
              currentSort={currentSort}
              className='w-[15%] text-base font-semibold'
            >
              Category
            </AdminServiceTableHeaderSort>
            <AdminServiceTableHeaderSort
              field='price'
              currentSort={currentSort}
              className='w-[10%] text-base font-semibold'
            >
              Price
            </AdminServiceTableHeaderSort>
            <AdminServiceTableHeaderSort
              field='status'
              currentSort={currentSort}
              className='w-[10%] text-base font-semibold'
            >
              Status
            </AdminServiceTableHeaderSort>
            <AdminServiceTableHeaderSort
              field='rating'
              currentSort={currentSort}
              className='w-[10%] text-base font-semibold'
            >
              Rating
            </AdminServiceTableHeaderSort>
            <AdminServiceTableHeaderSort
              field='createdAt'
              currentSort={currentSort}
              className='w-[15%] text-base font-semibold'
            >
              Created
            </AdminServiceTableHeaderSort>
            <TableHead className='w-[10%]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id} className='hover:bg-gray-50'>
              {/* Service Column */}
              <TableCell>
                <div className='flex items-center gap-3'>
                  <TableMedia media={service.media || []} />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <Link href={`/admin/services/${service.id}`}>
                        <h3 className='text-2sm font-medium text-gray-900 break-all line-clamp-3 hover:text-primary hover:underline cursor-pointer transition-colors'>
                          {service.title}
                        </h3>
                      </Link>
                      {service.featured && (
                        <Badge variant='default' className='gap-1'>
                          <Star className='h-3 w-3' />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      by {service.profile.displayName || service.profile.user.email}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Category Column */}
              <TableCell>
                <TaxonomiesDisplay categoryLabels={service.categoryLabels} compact />
              </TableCell>

              {/* Price Column */}
              <TableCell>
                <span className='text-sm'>
                  {formatPrice(service.price, service.fixed)}
                </span>
              </TableCell>

              {/* Status Column */}
              <TableCell>
                <ServiceStatusBadge status={service.status as Status} />
              </TableCell>

              {/* Rating Column */}
              <TableCell>
                <div className='flex flex-col gap-1'>
                  {renderStars(service.rating)}
                  <span className='text-xs text-muted-foreground'>
                    ({service.reviewCount} reviews)
                  </span>
                </div>
              </TableCell>

              {/* Created Date Column */}
              <TableCell>
                <span className='text-sm text-gray-600'>
                  {formatDate(service.createdAt)}
                </span>
              </TableCell>

              {/* Actions Column */}
              <TableCell className='text-right'>
                <div className='flex items-center justify-end gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    asChild
                  >
                    <Link href={`/admin/services/${service.id}`}>
                      <Edit className='w-4 h-4' />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
