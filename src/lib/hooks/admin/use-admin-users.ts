'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  listUsers, 
  createUser, 
  updateUser,
  setUserRole, 
  banUser, 
  unbanUser, 
  removeUser, 
  impersonateUser, 
  stopImpersonating,
  listUserSessions,
  revokeAllUserSessions,
  setUserPassword
} from '@/actions/admin/users';
import type { 
  AdminListUsersInput,
  AdminCreateUserInput,
  AdminUpdateUserInput,
  AdminSetRoleInput,
  AdminBanUserInput,
  AdminUnbanUserInput,
  AdminRemoveUserInput,
  AdminImpersonateUserInput,
  AdminSetPasswordInput
} from '@/lib/validations/admin';

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
  limit: number | undefined;
  offset: number | undefined;
}

interface UseAdminUsersProps {
  initialPageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useAdminUsers({
  initialPageSize = 10,
  autoRefresh = false,
  refreshInterval = 30000
}: UseAdminUsersProps = {}) {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Action states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Load users
  const loadUsers = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const filters: AdminListUsersInput = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        sortBy,
        sortDirection,
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

      if (statusFilter !== 'all') {
        // Handle status filtering
        switch (statusFilter) {
          case 'banned':
            filters.filterField = 'banned';
            filters.filterOperator = 'eq';
            filters.filterValue = 'true';
            break;
          case 'blocked':
            filters.filterField = 'blocked';
            filters.filterOperator = 'eq';
            filters.filterValue = 'true';
            break;
          case 'unverified':
            filters.filterField = 'emailVerified';
            filters.filterOperator = 'eq';
            filters.filterValue = 'false';
            break;
        }
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
      if (showLoading) setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, roleFilter, statusFilter, sortBy, sortDirection]);

  // User management actions
  const createUserAction = async (data: AdminCreateUserInput) => {
    try {
      setIsCreating(true);
      const result = await createUser(data);
      
      if (result.success) {
        toast.success('User created successfully');
        await loadUsers(false); // Refresh without loading state
        return result.data;
      } else {
        toast.error(result.error || 'Failed to create user');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateUserAction = async (data: AdminUpdateUserInput) => {
    try {
      setIsUpdating(true);
      const result = await updateUser(data);
      
      if (result.success) {
        toast.success('User updated successfully');
        await loadUsers(false);
        return result.data;
      } else {
        toast.error(result.error || 'Failed to update user');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const setRoleAction = async (data: AdminSetRoleInput) => {
    try {
      const result = await setUserRole(data);
      
      if (result.success) {
        toast.success('User role updated successfully');
        await loadUsers(false);
        return result.data;
      } else {
        toast.error(result.error || 'Failed to update user role');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const banUserAction = async (data: AdminBanUserInput) => {
    try {
      const result = await banUser(data);
      
      if (result.success) {
        toast.success('User banned successfully');
        await loadUsers(false);
        return result.data;
      } else {
        toast.error(result.error || 'Failed to ban user');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  };

  const unbanUserAction = async (data: AdminUnbanUserInput) => {
    try {
      const result = await unbanUser(data);
      
      if (result.success) {
        toast.success('User unbanned successfully');
        await loadUsers(false);
        return result.data;
      } else {
        toast.error(result.error || 'Failed to unban user');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  };

  const deleteUserAction = async (data: AdminRemoveUserInput) => {
    try {
      setIsDeleting(true);
      const result = await removeUser(data);
      
      if (result.success) {
        toast.success('User deleted successfully');
        await loadUsers(false);
        return result.data;
      } else {
        toast.error(result.error || 'Failed to delete user');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const impersonateUserAction = async (data: AdminImpersonateUserInput) => {
    try {
      const result = await impersonateUser(data);
      
      if (result.success) {
        toast.success('Now impersonating user');
        // Redirect handled by calling component
        return result.data;
      } else {
        toast.error(result.error || 'Failed to impersonate user');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
      throw error;
    }
  };

  const stopImpersonatingAction = async () => {
    try {
      const result = await stopImpersonating();
      
      if (result.success) {
        toast.success('Stopped impersonating user');
        return result.data;
      } else {
        toast.error(result.error || 'Failed to stop impersonation');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      throw error;
    }
  };

  const setPasswordAction = async (data: AdminSetPasswordInput) => {
    try {
      const result = await setUserPassword(data);
      
      if (result.success) {
        toast.success('Password updated successfully');
        return result.data;
      } else {
        toast.error(result.error || 'Failed to update password');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const getUserSessionsAction = async (userId: string) => {
    try {
      const result = await listUserSessions(userId);
      
      if (result.success) {
        return result.data;
      } else {
        toast.error(result.error || 'Failed to load user sessions');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error loading user sessions:', error);
      throw error;
    }
  };

  const revokeAllSessionsAction = async (userId: string) => {
    try {
      const result = await revokeAllUserSessions({ userId });
      
      if (result.success) {
        toast.success('All user sessions revoked');
        return result.data;
      } else {
        toast.error(result.error || 'Failed to revoke sessions');
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error revoking sessions:', error);
      throw error;
    }
  };

  // Bulk actions
  const bulkBanUsers = async (userIds: string[], banReason: string, banExpiresIn?: number) => {
    const promises = userIds.map(userId => 
      banUserAction({ userId, banReason, banExpiresIn })
    );
    
    try {
      await Promise.all(promises);
      toast.success(`${userIds.length} users banned successfully`);
    } catch (error) {
      toast.error('Some users could not be banned');
    }
  };

  const bulkUnbanUsers = async (userIds: string[]) => {
    const promises = userIds.map(userId => 
      unbanUserAction({ userId })
    );
    
    try {
      await Promise.all(promises);
      toast.success(`${userIds.length} users unbanned successfully`);
    } catch (error) {
      toast.error('Some users could not be unbanned');
    }
  };

  const bulkDeleteUsers = async (userIds: string[]) => {
    const promises = userIds.map(userId => 
      deleteUserAction({ userId })
    );
    
    try {
      await Promise.all(promises);
      toast.success(`${userIds.length} users deleted successfully`);
    } catch (error) {
      toast.error('Some users could not be deleted');
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Search and filter helpers
  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const updateFilters = (filters: {
    search?: string;
    role?: string;
    status?: string;
  }) => {
    if (filters.search !== undefined) setSearchQuery(filters.search);
    if (filters.role !== undefined) setRoleFilter(filters.role);
    if (filters.status !== undefined) setStatusFilter(filters.status);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Selection helpers
  const selectUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const allUserIds = users.map(user => user.id);
    setSelectedUserIds(allUserIds);
  };

  const clearSelection = () => {
    setSelectedUserIds([]);
  };

  const isUserSelected = (userId: string) => {
    return selectedUserIds.includes(userId);
  };

  const isAllUsersSelected = () => {
    return users.length > 0 && users.every(user => selectedUserIds.includes(user.id));
  };

  // Auto-refresh
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        loadUsers(false); // Refresh without showing loading state
      }, refreshInterval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, loadUsers]);

  // Initial load and filter changes
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    // Data
    users,
    total,
    loading,
    
    // Pagination
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    
    // Filters
    searchQuery,
    roleFilter,
    statusFilter,
    sortBy,
    sortDirection,
    updateFilters,
    clearFilters,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setSortBy,
    setSortDirection,
    
    // Selection
    selectedUserIds,
    selectUser,
    selectAllUsers,
    clearSelection,
    isUserSelected,
    isAllUsersSelected,
    
    // Actions
    createUser: createUserAction,
    updateUser: updateUserAction,
    setRole: setRoleAction,
    banUser: banUserAction,
    unbanUser: unbanUserAction,
    deleteUser: deleteUserAction,
    impersonateUser: impersonateUserAction,
    stopImpersonating: stopImpersonatingAction,
    setPassword: setPasswordAction,
    getUserSessions: getUserSessionsAction,
    revokeAllSessions: revokeAllSessionsAction,
    
    // Bulk actions
    bulkBanUsers,
    bulkUnbanUsers,
    bulkDeleteUsers,
    
    // State
    isCreating,
    isUpdating,
    isDeleting,
    
    // Utilities
    refresh: () => loadUsers(false),
    hardRefresh: () => loadUsers(true),
  };
}