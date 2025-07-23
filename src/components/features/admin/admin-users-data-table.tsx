'use client';

import React from 'react';
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getSortedRowModel,
  SortingState,
  Row
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Edit, 
  Shield, 
  Ban, 
  UnlockKeyhole, 
  Trash2, 
  Eye, 
  LogOut, 
  Key 
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: Date | null;
  confirmed: boolean;
  blocked: boolean;
  step: string;
  displayName?: string | null;
  username?: string | null;
}

interface AdminUsersDataTableProps {
  data: User[];
  loading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onEditUser?: (user: User) => void;
  onSetPassword?: (user: User) => void;
  onViewSessions?: (user: User) => void;
  onImpersonateUser?: (userId: string) => void;
  onToggleRole?: (userId: string, currentRole: string) => void;
  onBanUser?: (user: User) => void;
  onUnbanUser?: (userId: string) => void;
  onDeleteUser?: (user: User) => void;
}

export function AdminUsersDataTable({
  data,
  loading = false,
  selectedIds = [],
  onSelectionChange,
  onEditUser,
  onSetPassword,
  onViewSessions,
  onImpersonateUser,
  onToggleRole,
  onBanUser,
  onUnbanUser,
  onDeleteUser,
}: AdminUsersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Helper functions
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive' as const;
      case 'freelancer': return 'default' as const;
      case 'company': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.banned) {
      return <Badge variant="destructive">Banned</Badge>;
    }
    if (user.blocked) {
      return <Badge variant="destructive">Blocked</Badge>;
    }
    if (!user.emailVerified) {
      return <Badge variant="secondary">Unverified</Badge>;
    }
    if (!user.confirmed) {
      return <Badge variant="outline">Pending</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  // Column definitions
  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            const allIds = table.getRowModel().rows.map(row => row.original.id);
            onSelectionChange?.(
              table.getIsAllPageRowsSelected() || value 
                ? allIds 
                : []
            );
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            const selectedRows = table.getSelectedRowModel().rows;
            onSelectionChange?.(selectedRows.map(r => r.original.id));
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0"
          >
            User
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{user.name || 'No name'}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            {user.displayName && (
              <div className="text-xs text-muted-foreground">@{user.displayName}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0"
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return (
          <Badge variant={getRoleBadgeVariant(role)}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original),
    },
    {
      accessorKey: 'step',
      header: 'Step',
      cell: ({ row }) => {
        const step = row.getValue('step') as string;
        return <Badge variant="outline">{step}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date;
        return (
          <div className="space-y-1">
            <div className="text-sm">{new Date(date).toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(date).toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEditUser?.(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetPassword?.(user)}>
                <Key className="mr-2 h-4 w-4" />
                Set Password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewSessions?.(user)}>
                <Eye className="mr-2 h-4 w-4" />
                View Sessions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onImpersonateUser?.(user.id)}>
                <LogOut className="mr-2 h-4 w-4" />
                Impersonate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onToggleRole?.(user.id, user.role)}
              >
                <Shield className="mr-2 h-4 w-4" />
                {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
              </DropdownMenuItem>
              {user.banned ? (
                <DropdownMenuItem onClick={() => onUnbanUser?.(user.id)}>
                  <UnlockKeyhole className="mr-2 h-4 w-4" />
                  Unban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onBanUser?.(user)}>
                  <Ban className="mr-2 h-4 w-4" />
                  Ban User
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDeleteUser?.(user)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      rowSelection: data.reduce((acc, user, index) => {
        if (selectedIds.includes(user.id)) {
          acc[index] = true;
        }
        return acc;
      }, {} as Record<string, boolean>),
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={selectedIds.includes(row.original.id) ? 'bg-muted/50' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="text-muted-foreground">
                    No users found matching your criteria.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Selection summary */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedIds.length} of {data.length} user(s) selected
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange?.([])}
            >
              Clear selection
            </Button>
            {/* Additional bulk action buttons can be added here */}
          </div>
        </div>
      )}
    </div>
  );
}