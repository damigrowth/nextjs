import React from 'react';
import Link from 'next/link';
import { Edit, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';
import { Status } from '@prisma/client';
import TableMedia from '@/components/shared/table-media';
import ServiceStatusBadge from './service-status-badge';
import TaxonomiesDisplay from '../../shared/taxonomies-display';
import ServiceTableHeaderSort from './service-table-header-sort';
import type {
  UserServiceTableData,
  ServiceSortField,
  SortOrder,
} from '@/lib/types/services';

interface ServiceTableProps {
  services: UserServiceTableData[];
  currentSort: {
    field: ServiceSortField;
    order: SortOrder;
  };
  className?: string;
}

export default function ServiceTable({
  services,
  currentSort,
  className,
}: ServiceTableProps) {
  // Empty state
  if (services.length === 0) {
    return (
      <div className={cn('rounded-md border', className)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[18%] text-base font-semibold'>
                Υπηρεσία
              </TableHead>
              <TableHead className='w-[22%] text-base font-semibold'>
                Κατηγορία
              </TableHead>
              <TableHead className='w-[15%] text-base font-semibold'>
                Κατάσταση
              </TableHead>
              <TableHead className='w-[15%] text-base font-semibold'>
                Ενημέρωση
              </TableHead>
              <TableHead className='w-[15%] text-base font-semibold'>
                Δημιουργία
              </TableHead>
              <TableHead className='w-[10%]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className='h-32 text-center'>
                <div className='flex flex-col items-center justify-center space-y-3'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
                    <Edit className='w-8 h-8 text-gray-400' />
                  </div>
                  <div className='space-y-1'>
                    <h3 className='font-medium text-gray-900'>
                      Δεν έχεις υπηρεσίες ακόμα
                    </h3>
                    <p className='text-sm text-gray-500'>
                      Δημιούργησε την πρώτη σου υπηρεσία για να ξεκινήσεις
                    </p>
                  </div>
                  <Button asChild>
                    <Link href='/dashboard/services/create'>
                      Δημιουργία Υπηρεσίας
                    </Link>
                  </Button>
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
            <ServiceTableHeaderSort
              field='title'
              currentSort={currentSort}
              className='w-[35%] text-base font-semibold'
            >
              Υπηρεσία
            </ServiceTableHeaderSort>
            <ServiceTableHeaderSort
              field='category'
              currentSort={currentSort}
              className='w-[30%] text-base font-semibold'
            >
              Κατηγορία
            </ServiceTableHeaderSort>
            <ServiceTableHeaderSort
              field='status'
              currentSort={currentSort}
              className='w-[10%] text-base font-semibold'
            >
              Κατάσταση
            </ServiceTableHeaderSort>
            <ServiceTableHeaderSort
              field='updatedAt'
              currentSort={currentSort}
              className='w-[10%] text-base font-semibold'
            >
              Ενημέρωση
            </ServiceTableHeaderSort>
            <ServiceTableHeaderSort
              field='createdAt'
              currentSort={currentSort}
              className='w-[10%] text-base font-semibold'
            >
              Δημιουργία
            </ServiceTableHeaderSort>
            <TableHead className='w-[5%]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id} className='hover:bg-gray-50'>
              {/* Service Column */}
              <TableCell>
                <div className='flex items-center gap-3'>
                  {/* Media Thumbnail */}
                  <TableMedia media={service.media || []} />

                  {/* Title and Info */}
                  <div className='flex-1 min-w-0'>
                    <Link href={`/dashboard/services/edit/${service.id}`}>
                      <h3 className='text-2sm font-medium text-gray-900 break-all line-clamp-3 hover:text-primary hover:underline cursor-pointer transition-colors'>
                        {service.title}
                      </h3>
                    </Link>
                  </div>
                </div>
              </TableCell>

              {/* Category Column */}
              <TableCell>
                <TaxonomiesDisplay
                  categoryLabels={service.categoryLabels}
                  compact
                />
              </TableCell>

              {/* Status Column */}
              <TableCell>
                <ServiceStatusBadge status={service.status as Status} />
              </TableCell>

              {/* Updated Date Column */}
              <TableCell>
                <span className='text-2sm text-gray-600'>
                  {formatDate(service.updatedAt)}
                </span>
              </TableCell>

              {/* Created Date Column */}
              <TableCell>
                <span className='text-2sm text-gray-600'>
                  {formatDate(service.createdAt)}
                </span>
              </TableCell>

              {/* Actions Column */}
              <TableCell className='text-right'>
                <div className='flex items-center justify-end gap-1'>
                  {service.status === Status.published && service.slug && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      asChild
                    >
                      <Link href={`/s/${service.slug}`} target='_blank'>
                        <Eye className='w-4 h-4' />
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    asChild
                  >
                    <Link href={`/dashboard/services/edit/${service.id}`}>
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
