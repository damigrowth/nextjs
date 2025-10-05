'use client';

import React from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProfileBadges } from '@/components/shared';
import { ArrowUpDown, Edit, Star, Copy, Check } from 'lucide-react';
import TaxonomiesDisplay from '@/components/shared/taxonomies-display';
import { formatDate, formatTime } from '@/lib/utils/date';
import { useState } from 'react';

// Copyable text component with hover state
function CopyableText({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group flex items-center gap-2 cursor-pointer hover:text-primary transition-colors ${className}`}
      onClick={handleCopy}
    >
      <span>{text}</span>
      {copied ? (
        <Check className='h-3 w-3 text-green-600' />
      ) : (
        <Copy className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity' />
      )}
    </div>
  );
}

interface Profile {
  id: string;
  uid: string;
  type: string | null;
  username: string | null;
  displayName: string | null;
  email: string | null;
  image: string | null;
  category: string | null;
  subcategory: string | null;
  published: boolean;
  featured: boolean;
  verified: boolean;
  top: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    banned: boolean;
    blocked: boolean;
  };
  verification?: {
    status: string;
  } | null;
  _count: {
    services: number;
    reviews: number;
  };
}

interface AdminProfilesDataTableProps {
  data: Profile[];
  loading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function AdminProfilesDataTable({
  data,
  loading = false,
  selectedIds = [],
  onSelectionChange,
}: AdminProfilesDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Helper functions
  const getTypeBadgeVariant = (type: string | null) => {
    switch (type) {
      case 'freelancer':
        return 'default' as const;
      case 'company':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
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
  const columns: ColumnDef<Profile>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? 'indeterminate'
                : false
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            const allIds = table.getRowModel().rows.map((row) => row.original.id);
            onSelectionChange?.(
              table.getIsAllPageRowsSelected() || value ? allIds : [],
            );
          }}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            const selectedRows = table.getSelectedRowModel().rows;
            onSelectionChange?.(selectedRows.map((r) => r.original.id));
          }}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'displayName',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-auto p-0'
          >
            Profile
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const profile = row.original;
        const displayName = profile.displayName || profile.user.name || 'Unknown';
        const email = profile.email || profile.user.email;

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={profile.image || undefined} alt={displayName} />
              <AvatarFallback>
                {getInitials(displayName, email)}
              </AvatarFallback>
            </Avatar>
            <div className='space-y-1'>
              <div className='font-medium'>{displayName}</div>
              <CopyableText text={email} className='text-sm text-muted-foreground' />
              {profile.username && (
                <CopyableText
                  text={profile.username}
                  className='text-xs text-muted-foreground'
                />
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'relatedUser',
      header: 'Related User',
      cell: ({ row }) => {
        const profile = row.original;
        const userId = profile.user.id;
        const userEmail = profile.user.email;

        return (
          <Link
            href={`/admin/users/${userId}`}
            className='text-sm font-medium hover:text-primary transition-colors hover:underline'
          >
            {userEmail}
          </Link>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string | null;
        if (!type) return <Badge variant='outline'>N/A</Badge>;

        return (
          <Badge variant={getTypeBadgeVariant(type)}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const profile = row.original as any;

        if (!profile.categoryLabels) {
          return <span className='text-muted-foreground text-sm'>-</span>;
        }

        return (
          <TaxonomiesDisplay
            categoryLabels={profile.categoryLabels}
            compact
          />
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const profile = row.original;

        return (
          <ProfileBadges
            published={profile.published}
            featured={profile.featured}
            verified={profile.verified}
            topLevel={profile.top}
          />
        );
      },
    },
    {
      accessorKey: 'services',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-auto p-0'
          >
            Services
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const profile = row.original;
        const serviceCount = profile._count.services;

        return (
          <div className='text-sm font-medium'>
            {serviceCount}
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
            className='h-auto p-0'
          >
            Created
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date;
        return (
          <div className='text-sm text-muted-foreground'>
            <div>{formatDate(date)}</div>
            <div className='text-xs'>{formatTime(date)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-auto p-0'
          >
            Updated
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('updatedAt') as Date;
        return (
          <div className='text-sm text-muted-foreground'>
            <div>{formatDate(date)}</div>
            <div className='text-xs'>{formatTime(date)}</div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const profile = row.original;

        return (
          <div className='flex items-center justify-end'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              asChild
            >
              <Link href={`/admin/profiles/${profile.id}`}>
                <Edit className='w-4 h-4' />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  // Table setup
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection: data.reduce(
        (acc, profile, index) => {
          if (selectedIds.includes(profile.id)) {
            acc[index] = true;
          }
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    },
  });

  return (
    <div className='w-full'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className='px-4'>
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                    <span className='ml-2'>Loading profiles...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={
                    selectedIds.includes(row.original.id) ? 'bg-muted/50' : ''
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='px-4'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  <div className='text-muted-foreground'>
                    No profiles found matching your criteria.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Selection summary */}
      {selectedIds.length > 0 && (
        <div className='flex items-center justify-between pt-4'>
          <div className='text-sm text-muted-foreground'>
            {selectedIds.length} of {data.length} profile(s) selected
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onSelectionChange?.([])}
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
