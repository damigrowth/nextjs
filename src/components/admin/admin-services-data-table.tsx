'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Star,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  Euro,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

interface Service {
  id: number;
  pid: string;
  slug: string | null;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  subdivision: string;
  tags: string[];
  fixed: boolean;
  price: number | null;
  type: any;
  subscriptionType: string | null;
  duration: number | null;
  featured: boolean;
  rating: number;
  reviewCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: string;
    displayName: string | null;
    username: string | null;
    image: string | null;
    user: {
      email: string;
      name: string | null;
      role: string;
    };
  };
  _count: {
    reviews: number;
  };
}

interface AdminServicesDataTableProps {
  services: Service[];
  onTogglePublished?: (serviceId: number) => void;
  onToggleFeatured?: (serviceId: number) => void;
  onUpdateStatus?: (service: Service, status: string) => void;
  onDelete?: (service: Service) => void;
}

export function AdminServicesDataTable({
  services,
  onTogglePublished,
  onToggleFeatured,
  onUpdateStatus,
  onDelete,
}: AdminServicesDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Helper functions
  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      draft: { variant: 'outline', label: 'Draft' },
      pending: { variant: 'secondary', label: 'Pending' },
      published: { variant: 'default', label: 'Published' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      inactive: { variant: 'outline', label: 'Inactive' },
    };
    return variants[status] || { variant: 'outline', label: status };
  };

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

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Column definitions
  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='hover:bg-transparent p-0'
          >
            Service
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className='flex items-start space-x-3 min-w-[300px]'>
            <Avatar className='h-10 w-10 flex-shrink-0'>
              <AvatarImage
                src={service.profile.image || undefined}
                alt={service.profile.displayName || 'User'}
              />
              <AvatarFallback>
                {getInitials(
                  service.profile.displayName,
                  service.profile.user.email,
                )}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <p className='font-medium truncate'>{service.title}</p>
                {service.featured && (
                  <Badge variant='default' className='bg-yellow-500 text-yellow-900 text-xs'>
                    Featured
                  </Badge>
                )}
              </div>
              <p className='text-xs text-muted-foreground mb-1'>
                by {service.profile.displayName || service.profile.user.name || 'Unknown'}
              </p>
              <p className='text-xs text-muted-foreground line-clamp-1'>
                {service.description}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className='flex flex-col gap-1'>
            <Badge variant='outline' className='text-xs w-fit'>
              {service.category}
            </Badge>
            {service.subcategory && (
              <span className='text-xs text-muted-foreground'>
                {service.subcategory}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='hover:bg-transparent p-0'
          >
            <Euro className='mr-1 h-3 w-3' />
            Price
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className='font-medium'>
            {formatPrice(service.price, service.fixed)}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const service = row.original;
        const statusInfo = getStatusBadge(service.status);
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      accessorKey: 'rating',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='hover:bg-transparent p-0'
          >
            Rating
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className='flex flex-col gap-1'>
            {renderStars(service.rating)}
            <span className='text-xs text-muted-foreground'>
              {service.rating.toFixed(1)} ({service._count.reviews} reviews)
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='hover:bg-transparent p-0'
          >
            Created
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className='text-sm'>
            {formatDate(new Date(row.original.createdAt))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const service = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/services/${service.id}`}
                  className='cursor-pointer'
                >
                  <Eye className='mr-2 h-4 w-4' />
                  View Details
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href={`/profiles/${service.profile.username || service.pid}`}
                  className='cursor-pointer'
                  target='_blank'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  View Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Status Management</DropdownMenuLabel>

              {service.status === 'pending' && (
                <>
                  <DropdownMenuItem
                    onClick={() => onUpdateStatus?.(service, 'approved')}
                  >
                    <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onUpdateStatus?.(service, 'rejected')}
                  >
                    <XCircle className='mr-2 h-4 w-4 text-red-600' />
                    Reject
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuItem
                onClick={() => onTogglePublished?.(service.id)}
              >
                {service.status === 'published' ? (
                  <>
                    <XCircle className='mr-2 h-4 w-4' />
                    Unpublish
                  </>
                ) : (
                  <>
                    <CheckCircle2 className='mr-2 h-4 w-4' />
                    Publish
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onToggleFeatured?.(service.id)}
              >
                <Star
                  className={`mr-2 h-4 w-4 ${service.featured ? 'fill-yellow-400 text-yellow-400' : ''}`}
                />
                {service.featured ? 'Unfeature' : 'Feature'}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete?.(service)}
                className='text-red-600'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Service
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: services,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No services found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
