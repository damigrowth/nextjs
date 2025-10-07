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
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowUpDown,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface VerificationProfile {
  id: string;
  displayName: string;
  avatar: string | null;
  type: string;
  user: {
    id: string;
    email: string;
  };
}

interface Verification {
  id: string;
  status: string;
  afm: string | null;
  name: string | null;
  address: string | null;
  phone: string | null;
  uid: string;
  pid: string;
  createdAt: Date;
  updatedAt: Date;
  profile: VerificationProfile;
}

interface AdminVerificationsDataTableProps {
  data: Verification[];
  loading?: boolean;
  onView?: (verification: Verification) => void;
  onApprove?: (verification: Verification) => void;
  onReject?: (verification: Verification) => void;
  onDelete?: (verification: Verification) => void;
}

// CopyableText component
function CopyableText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 cursor-pointer hover:text-primary transition-colors',
        className,
      )}
      onClick={handleCopy}
    >
      <span className='text-sm font-mono'>{text}</span>
      {copied ? (
        <Check className='h-3 w-3 text-green-600' />
      ) : (
        <Copy className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity' />
      )}
    </div>
  );
}

export function AdminVerificationsDataTable({
  data,
  loading = false,
  onView,
  onApprove,
  onReject,
  onDelete,
}: AdminVerificationsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Helper function for status badge
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default' as const; // Green
      case 'REJECTED':
        return 'destructive' as const; // Red
      case 'PENDING':
        return 'secondary' as const; // Yellow/Gray
      default:
        return 'outline' as const;
    }
  };

  // Column definitions
  const columns: ColumnDef<Verification>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => {
        const id = row.original.id;
        return <CopyableText text={id.slice(0, 8)} className='text-xs' />;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='h-auto p-0'
          >
            Status
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'afm',
      header: 'AFM',
      cell: ({ row }) => {
        const afm = row.original.afm;
        return afm ? (
          <CopyableText text={afm} />
        ) : (
          <span className='text-muted-foreground text-sm'>—</span>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Business Name',
      cell: ({ row }) => {
        const name = row.original.name;
        return (
          <div className='max-w-[200px] truncate'>
            {name || <span className='text-muted-foreground text-sm'>—</span>}
          </div>
        );
      },
    },
    {
      id: 'profile',
      header: 'Profile',
      cell: ({ row }) => {
        const verification = row.original;
        const profile = verification.profile;
        return (
          <Link
            href={`/admin/profiles?id=${verification.pid}`}
            className='hover:underline'
          >
            <div className='flex items-center gap-2'>
              <Avatar className='h-8 w-8'>
                <AvatarImage src={profile.avatar || undefined} />
                <AvatarFallback>
                  {profile.displayName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <p className='font-medium truncate text-sm'>
                  {profile.displayName}
                </p>
                <Badge variant='outline' className='text-xs'>
                  {profile.type}
                </Badge>
              </div>
            </div>
          </Link>
        );
      },
    },
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => {
        const verification = row.original;
        const user = verification.profile.user;
        return (
          <Link
            href={`/admin/users?id=${verification.uid}`}
            className='hover:underline'
          >
            <CopyableText text={user.email} className='text-sm' />
          </Link>
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
        return <div className='text-sm'>{formatDate(date)}</div>;
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const verification = row.original;
        const isPending = verification.status === 'PENDING';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onView?.(verification)}>
                <Eye className='mr-2 h-4 w-4' />
                View Details
              </DropdownMenuItem>

              {isPending && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onApprove?.(verification)}>
                    <CheckCircle className='mr-2 h-4 w-4 text-green-600' />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReject?.(verification)}>
                    <XCircle className='mr-2 h-4 w-4 text-red-600' />
                    Reject
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(verification)}
                className='text-destructive focus:text-destructive'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-muted-foreground'>Loading verifications...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <p className='text-muted-foreground'>No verifications found</p>
          <p className='text-sm text-muted-foreground mt-1'>
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
