'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  UserPlus,
  Shield,
  Ban,
  UnlockKeyhole,
  Trash2,
  Eye,
  LogOut,
  Edit,
  Key,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
} from 'lucide-react';

import {
  createUserFormSchema,
  editUserFormSchema,
  banUserFormSchema,
  setPasswordFormSchema,
  type CreateUserFormInput,
  type EditUserFormInput,
  type BanUserFormInput,
  type SetPasswordFormInput,
  getAllowedRoles,
  banDurationToSeconds,
} from '@/lib/validations/admin';

import {
  listUsers,
  createUser,
  setUserRole,
  banUser,
  unbanUser,
  removeUser,
  impersonateUser,
  stopImpersonating,
  listUserSessions,
  revokeAllUserSessions,
  setUserPassword,
  updateUser,
} from '@/actions/admin/users';

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

interface UserListResponse {
  users: User[];
  total: number;
  limit?: number;
  offset?: number;
}

export function UserManagement() {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [banUserOpen, setBanUserOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSessions, setUserSessions] = useState<any[]>([]);

  // Form initialization
  const createUserForm = useForm<CreateUserFormInput>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      sendWelcomeEmail: true,
      autoVerify: true,
    },
  });

  const editUserForm = useForm<EditUserFormInput>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      displayName: '',
      username: '',
      role: 'user',
      confirmed: true,
      blocked: false,
      emailVerified: true,
    },
  });

  const banUserForm = useForm<BanUserFormInput>({
    resolver: zodResolver(banUserFormSchema),
    defaultValues: {
      userId: '',
      banReason: '',
      banDuration: 7,
      isPermanent: false,
    },
  });

  const setPasswordForm = useForm<SetPasswordFormInput>({
    resolver: zodResolver(setPasswordFormSchema),
    defaultValues: {
      userId: '',
      newPassword: '',
      confirmPassword: '',
      sendNotification: true,
    },
  });

  // Data loading
  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters: any = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        sortBy: 'createdAt',
        sortDirection: 'desc' as const,
      };

      if (searchQuery) {
        filters.searchField = 'email';
        filters.searchOperator = 'contains';
        filters.searchValue = searchQuery;
      }

      if (roleFilter !== 'all') {
        filters.filterField = 'role';
        filters.filterOperator = 'eq';
        filters.filterValue = roleFilter;
      }

      const result = await listUsers(filters);

      if (result.success && result.data) {
        const data = result.data as UserListResponse;
        setUsers(data.users);
        setTotal(data.total);
      } else {
        toast.error(result.error || 'Failed to load users');
      }
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchQuery, roleFilter, statusFilter]);

  // Form handlers
  const handleCreateUser = async (data: CreateUserFormInput) => {
    try {
      const result = await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        emailVerified: data.autoVerify,
        confirmed: data.autoVerify,
      });

      if (result.success) {
        toast.success('User created successfully');
        setCreateUserOpen(false);
        createUserForm.reset();
        loadUsers();
      } else {
        toast.error(result.error || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Failed to create user');
      console.error('Error creating user:', error);
    }
  };

  const handleEditUser = async (data: EditUserFormInput) => {
    if (!selectedUser) return;

    try {
      const updateData: any = { userId: selectedUser.id };

      if (data.name) updateData.name = data.name;
      if (data.email) updateData.email = data.email;
      if (data.displayName) updateData.displayName = data.displayName;
      if (data.username) updateData.username = data.username;
      if (data.confirmed !== undefined) updateData.confirmed = data.confirmed;
      if (data.blocked !== undefined) updateData.blocked = data.blocked;
      if (data.emailVerified !== undefined)
        updateData.emailVerified = data.emailVerified;

      // Handle role update separately
      if (data.role && data.role !== selectedUser.role) {
        const roleResult = await setUserRole({
          userId: selectedUser.id,
          role: data.role,
        });

        if (!roleResult.success) {
          toast.error('Failed to update user role');
          return;
        }
      }

      const result = await updateUser(updateData);

      if (result.success) {
        toast.success('User updated successfully');
        setEditUserOpen(false);
        setSelectedUser(null);
        editUserForm.reset();
        loadUsers();
      } else {
        toast.error(result.error || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Error updating user:', error);
    }
  };

  const handleBanUser = async (data: BanUserFormInput) => {
    if (!selectedUser) return;

    try {
      const banData: any = {
        userId: selectedUser.id,
        banReason: data.banReason,
      };

      if (!data.isPermanent && data.banDuration) {
        banData.banExpiresIn = banDurationToSeconds(data.banDuration);
      }

      const result = await banUser(banData);

      if (result.success) {
        toast.success('User banned successfully');
        setBanUserOpen(false);
        setSelectedUser(null);
        banUserForm.reset();
        loadUsers();
      } else {
        toast.error(result.error || 'Failed to ban user');
      }
    } catch (error) {
      toast.error('Failed to ban user');
      console.error('Error banning user:', error);
    }
  };

  const handleSetPassword = async (data: SetPasswordFormInput) => {
    if (!selectedUser) return;

    try {
      const result = await setUserPassword({
        userId: selectedUser.id,
        newPassword: data.newPassword,
      });

      if (result.success) {
        toast.success('Password updated successfully');
        setSetPasswordOpen(false);
        setSelectedUser(null);
        setPasswordForm.reset();
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Failed to update password');
      console.error('Error updating password:', error);
    }
  };

  // Other handlers (unchanged from original)
  const handleUnbanUser = async (userId: string) => {
    try {
      const result = await unbanUser({ userId });

      if (result.success) {
        toast.success('User unbanned successfully');
        loadUsers();
      } else {
        toast.error(result.error || 'Failed to unban user');
      }
    } catch (error) {
      toast.error('Failed to unban user');
      console.error('Error unbanning user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const result = await removeUser({ userId: selectedUser.id });

      if (result.success) {
        toast.success('User deleted successfully');
        setDeleteUserOpen(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  const handleImpersonateUser = async (userId: string) => {
    try {
      const result = await impersonateUser({ userId });

      if (result.success) {
        toast.success('Now impersonating user');
        window.location.href = '/dashboard';
      } else {
        toast.error(result.error || 'Failed to impersonate user');
      }
    } catch (error) {
      toast.error('Failed to impersonate user');
      console.error('Error impersonating user:', error);
    }
  };

  const handleViewSessions = async (user: User) => {
    try {
      const result = await listUserSessions(user.id);

      if (result.success) {
        // Ensure result.data is an array
        const sessions = Array.isArray(result.data)
          ? result.data
          : (result.data as any)?.sessions
            ? (result.data as any).sessions
            : [];
        setUserSessions(sessions);
        setSelectedUser(user);
        setSessionsOpen(true);
      } else {
        toast.error(result.error || 'Failed to load user sessions');
      }
    } catch (error) {
      toast.error('Failed to load user sessions');
      console.error('Error loading user sessions:', error);
    }
  };

  const handleRevokeAllSessions = async (userId: string) => {
    try {
      const result = await revokeAllUserSessions({ userId });

      if (result.success) {
        toast.success('All user sessions revoked');
        handleViewSessions(selectedUser!);
      } else {
        toast.error(result.error || 'Failed to revoke sessions');
      }
    } catch (error) {
      toast.error('Failed to revoke sessions');
      console.error('Error revoking sessions:', error);
    }
  };

  // Helper functions
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'freelancer':
        return 'default';
      case 'company':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.banned) {
      return <Badge variant='destructive'>Banned</Badge>;
    }
    if (user.blocked) {
      return <Badge variant='destructive'>Blocked</Badge>;
    }
    if (!user.emailVerified) {
      return <Badge variant='secondary'>Unverified</Badge>;
    }
    if (!user.confirmed) {
      return <Badge variant='outline'>Pending</Badge>;
    }
    return <Badge variant='default'>Active</Badge>;
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    editUserForm.reset({
      name: user.name || '',
      email: user.email,
      displayName: user.displayName || '',
      username: user.username || '',
      role: user.role as any,
      confirmed: user.confirmed,
      blocked: user.blocked,
      emailVerified: !!user.emailVerified,
    });
    setEditUserOpen(true);
  };

  const openBanDialog = (user: User) => {
    setSelectedUser(user);
    banUserForm.reset({
      userId: user.id,
      banReason: '',
      banDuration: 7,
      isPermanent: false,
    });
    setBanUserOpen(true);
  };

  const openSetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setPasswordForm.reset({
      userId: user.id,
      newPassword: '',
      confirmPassword: '',
      sendNotification: true,
    });
    setSetPasswordOpen(true);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>User Management</h2>
          <p className='text-muted-foreground'>
            Manage users, roles, and permissions with Better Auth
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={loadUsers} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className='mr-2 h-4 w-4' />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with specified role and permissions.
                </DialogDescription>
              </DialogHeader>
              <Form {...createUserForm}>
                <form
                  onSubmit={createUserForm.handleSubmit(handleCreateUser)}
                  className='space-y-4'
                >
                  <FormField
                    control={createUserForm.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Full name' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='user@example.com'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='••••••••'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='••••••••'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createUserForm.control}
                    name='role'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a role' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAllowedRoles('admin').map((role) => (
                              <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='flex items-center space-x-4'>
                    <FormField
                      control={createUserForm.control}
                      name='autoVerify'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel>Auto-verify email</FormLabel>
                            <FormDescription>
                              Mark email as verified on creation
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setCreateUserOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      variant='black'
                      disabled={createUserForm.formState.isSubmitting}
                    >
                      {createUserForm.formState.isSubmitting
                        ? 'Creating...'
                        : 'Create User'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Filter className='mr-2 h-4 w-4' />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search by email...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='All Roles' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='user'>User</SelectItem>
                <SelectItem value='freelancer'>Επαγγελματίας</SelectItem>
                <SelectItem value='company'>Επιχείρηση</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='banned'>Banned</SelectItem>
                <SelectItem value='blocked'>Blocked</SelectItem>
                <SelectItem value='unverified'>Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({total})</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-8'>
                    <div className='flex items-center justify-center'>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-8'>
                    <div className='text-muted-foreground'>
                      No users found matching your criteria
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className='font-medium'>
                          {user.name || 'No name'}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {user.email}
                        </div>
                        {user.displayName && (
                          <div className='text-xs text-muted-foreground'>
                            @{user.displayName}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{user.step}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openSetPasswordDialog(user)}
                          >
                            <Key className='mr-2 h-4 w-4' />
                            Set Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewSessions(user)}
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            View Sessions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleImpersonateUser(user.id)}
                          >
                            <LogOut className='mr-2 h-4 w-4' />
                            Impersonate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setUserRole({
                                userId: user.id,
                                role: user.role === 'admin' ? 'user' : 'admin',
                              })
                            }
                          >
                            <Shield className='mr-2 h-4 w-4' />
                            {user.role === 'admin'
                              ? 'Remove Admin'
                              : 'Make Admin'}
                          </DropdownMenuItem>
                          {user.banned ? (
                            <DropdownMenuItem
                              onClick={() => handleUnbanUser(user.id)}
                            >
                              <UnlockKeyhole className='mr-2 h-4 w-4' />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => openBanDialog(user)}
                            >
                              <Ban className='mr-2 h-4 w-4' />
                              Ban User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteUserOpen(true);
                            }}
                            className='text-destructive'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, total)} of {total} users
        </p>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className='text-sm font-medium'>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          <Form {...editUserForm}>
            <form
              onSubmit={editUserForm.handleSubmit(handleEditUser)}
              className='space-y-4'
            >
              <FormField
                control={editUserForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Full name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='user@example.com'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a role' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAllowedRoles('admin').map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='space-y-4'>
                <FormField
                  control={editUserForm.control}
                  name='confirmed'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Confirmed</FormLabel>
                        <FormDescription>
                          User has confirmed their account
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editUserForm.control}
                  name='blocked'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Blocked</FormLabel>
                        <FormDescription>
                          Block user from accessing the system
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editUserForm.control}
                  name='emailVerified'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Email Verified</FormLabel>
                        <FormDescription>
                          Email address has been verified
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setEditUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={editUserForm.formState.isSubmitting}
                >
                  {editUserForm.formState.isSubmitting
                    ? 'Updating...'
                    : 'Update User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banUserOpen} onOpenChange={setBanUserOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban this user from accessing the platform. This will revoke all
              their sessions.
            </DialogDescription>
          </DialogHeader>
          <Form {...banUserForm}>
            <form
              onSubmit={banUserForm.handleSubmit(handleBanUser)}
              className='space-y-4'
            >
              <FormField
                control={banUserForm.control}
                name='banReason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ban Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Please provide a reason for banning this user...'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This reason will be displayed to the user.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={banUserForm.control}
                name='isPermanent'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Permanent Ban</FormLabel>
                      <FormDescription>Ban will never expire</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {!banUserForm.watch('isPermanent') && (
                <FormField
                  control={banUserForm.control}
                  name='banDuration'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ban Duration (days)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='7'
                          min='1'
                          max='365'
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Number of days until the ban expires (1-365 days)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Alert>
                <AlertDescription>
                  This action will immediately revoke all user sessions and
                  prevent login.
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setBanUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='destructive'
                  disabled={banUserForm.formState.isSubmitting}
                >
                  {banUserForm.formState.isSubmitting
                    ? 'Banning...'
                    : 'Ban User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Set Password Dialog */}
      <Dialog open={setPasswordOpen} onOpenChange={setSetPasswordOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Set New Password</DialogTitle>
            <DialogDescription>
              Set a new password for this user account.
            </DialogDescription>
          </DialogHeader>
          <Form {...setPasswordForm}>
            <form
              onSubmit={setPasswordForm.handleSubmit(handleSetPassword)}
              className='space-y-4'
            >
              <FormField
                control={setPasswordForm.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='••••••••'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={setPasswordForm.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='••••••••'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={setPasswordForm.control}
                name='sendNotification'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel>Send Notification</FormLabel>
                      <FormDescription>
                        Notify user about password change via email
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setSetPasswordOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={setPasswordForm.formState.isSubmitting}
                >
                  {setPasswordForm.formState.isSubmitting
                    ? 'Updating...'
                    : 'Update Password'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and all associated data.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Alert>
              <AlertDescription>
                You are about to delete <strong>{selectedUser.email}</strong>.
                This will remove all their data permanently.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteUserOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Sessions Dialog */}
      <Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>User Sessions</DialogTitle>
            <DialogDescription>
              Active sessions for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            {!Array.isArray(userSessions) || userSessions.length === 0 ? (
              <div className='text-center text-muted-foreground py-8'>
                No active sessions found
              </div>
            ) : (
              <div className='space-y-2'>
                {userSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className='flex items-center justify-between p-3 border rounded'
                  >
                    <div>
                      <div className='font-medium'>
                        Session {session.id.substring(0, 8)}...
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {session.ipAddress} •{' '}
                        {new Date(session.createdAt).toLocaleString()}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Expires: {new Date(session.expiresAt).toLocaleString()}
                      </div>
                    </div>
                    <Badge
                      variant={
                        new Date(session.expiresAt) > new Date()
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {new Date(session.expiresAt) > new Date()
                        ? 'Active'
                        : 'Expired'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setSessionsOpen(false)}>
              Close
            </Button>
            {Array.isArray(userSessions) && userSessions.length > 0 && (
              <Button
                variant='destructive'
                onClick={() =>
                  selectedUser && handleRevokeAllSessions(selectedUser.id)
                }
              >
                Revoke All Sessions
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
