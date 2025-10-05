'use client';

import { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  Users,
  Star,
  CheckCircle2,
  Award,
  TrendingUp,
} from 'lucide-react';

import {
  listProfiles,
  getProfile,
  updateProfile,
  togglePublished,
  toggleFeatured,
  toggleVerified,
  updateVerificationStatus,
  deleteProfile,
  getProfileStats,
} from '@/actions/admin/profiles';

import { AdminProfilesDataTable } from './admin-profiles-data-table';

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

interface ProfileListResponse {
  profiles: Profile[];
  total: number;
  limit?: number;
  offset?: number;
}

interface ProfileStatsResponse {
  total: number;
  published: number;
  featured: number;
  verified: number;
}

export function ProfileManagement() {
  // State management
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ProfileStatsResponse>({
    total: 0,
    published: 0,
    featured: 0,
    verified: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Dialog states
  const [deleteProfileOpen, setDeleteProfileOpen] = useState(false);
  const [viewServicesOpen, setViewServicesOpen] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Data loading
  const loadProfiles = async () => {
    try {
      setLoading(true);
      const filters: any = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        sortBy: 'createdAt' as const,
        sortDirection: 'desc' as const,
      };

      if (searchQuery) {
        filters.searchQuery = searchQuery;
      }

      if (typeFilter !== 'all') {
        filters.type = typeFilter;
      }

      if (publishedFilter !== 'all') {
        filters.published = publishedFilter;
      }

      if (verifiedFilter !== 'all') {
        filters.verified = verifiedFilter;
      }

      if (featuredFilter !== 'all') {
        filters.featured = featuredFilter;
      }

      if (categoryFilter) {
        filters.category = categoryFilter;
      }

      const result = await listProfiles(filters);

      if (result.success && result.data) {
        const data = result.data as ProfileListResponse;
        setProfiles(data.profiles);
        setTotal(data.total);
      } else {
        toast.error(result.error || 'Failed to load profiles');
      }
    } catch (error) {
      toast.error('Failed to load profiles');
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getProfileStats();
      if (result.success && result.data) {
        setStats(result.data as ProfileStatsResponse);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadProfiles();
    loadStats();
  }, [
    currentPage,
    searchQuery,
    typeFilter,
    publishedFilter,
    verifiedFilter,
    featuredFilter,
    categoryFilter,
  ]);

  // Action handlers
  const handleViewServices = (profile: Profile) => {
    setSelectedProfile(profile);
    setViewServicesOpen(true);
  };

  const handleTogglePublished = async (profileId: string) => {
    try {
      const result = await togglePublished({ profileId });
      if (result.success) {
        toast.success(
          result.data?.published
            ? 'Profile published successfully'
            : 'Profile unpublished successfully',
        );
        loadProfiles();
        loadStats();
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error toggling published:', error);
    }
  };

  const handleToggleFeatured = async (profileId: string) => {
    try {
      const result = await toggleFeatured({ profileId });
      if (result.success) {
        toast.success(
          result.data?.featured
            ? 'Profile featured successfully'
            : 'Profile unfeatured successfully',
        );
        loadProfiles();
        loadStats();
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error toggling featured:', error);
    }
  };

  const handleToggleVerified = async (profileId: string) => {
    try {
      const result = await toggleVerified({ profileId });
      if (result.success) {
        toast.success(
          result.data?.verified
            ? 'Profile verified successfully'
            : 'Profile unverified successfully',
        );
        loadProfiles();
        loadStats();
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error toggling verified:', error);
    }
  };

  const handleDeleteProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setDeleteProfileOpen(true);
  };

  const confirmDeleteProfile = async () => {
    if (!selectedProfile) return;

    try {
      const result = await deleteProfile({ profileId: selectedProfile.id });
      if (result.success) {
        toast.success('Profile deleted successfully');
        setDeleteProfileOpen(false);
        setSelectedProfile(null);
        loadProfiles();
        loadStats();
      } else {
        toast.error(result.error || 'Failed to delete profile');
      }
    } catch (error) {
      toast.error('Failed to delete profile');
      console.error('Error deleting profile:', error);
    }
  };

  // Pagination
  const totalPages = Math.ceil(total / pageSize);
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Profiles</h1>
          <p className='text-muted-foreground'>
            Manage freelancer and company profiles
          </p>
        </div>
        <Button onClick={loadProfiles} variant='outline' size='sm'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Profiles</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-base text-muted-foreground'>Total</span>
                <span className='text-lg font-semibold'>{stats.total}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base text-muted-foreground'>Published</span>
                <span className='text-lg font-semibold'>{stats.published}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base text-muted-foreground'>Draft</span>
                <span className='text-lg font-semibold'>{stats.total - stats.published}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Verification</CardTitle>
            <CheckCircle2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-base text-muted-foreground'>Verified</span>
                <span className='text-lg font-semibold'>{stats.verified}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base text-muted-foreground'>Unverified</span>
                <span className='text-lg font-semibold'>{stats.total - stats.verified}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Featured</CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-base text-muted-foreground'>Featured</span>
                <span className='text-lg font-semibold'>{stats.featured}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base text-muted-foreground'>Regular</span>
                <span className='text-lg font-semibold'>{stats.total - stats.featured}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Ratings</CardTitle>
            <Award className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-base text-muted-foreground'>Top Rated</span>
                <span className='text-lg font-semibold'>-</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base text-muted-foreground'>Average</span>
                <span className='text-lg font-semibold'>-</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Profiles ({total})</CardTitle>
          <CardDescription>
            Manage freelancer and company profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className='mb-4 space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search profiles...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9'
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='freelancer'>Επαγγελματίας</SelectItem>
                  <SelectItem value='company'>Επιχείρηση</SelectItem>
                </SelectContent>
              </Select>

              {/* Published Filter */}
              <Select
                value={publishedFilter}
                onValueChange={setPublishedFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All statuses' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='published'>Published</SelectItem>
                  <SelectItem value='draft'>Draft</SelectItem>
                </SelectContent>
              </Select>

              {/* Verified Filter */}
              <Select
                value={verifiedFilter}
                onValueChange={setVerifiedFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All verification' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='verified'>Verified</SelectItem>
                  <SelectItem value='unverified'>Unverified</SelectItem>
                </SelectContent>
              </Select>

              {/* Featured Filter */}
              <Select
                value={featuredFilter}
                onValueChange={setFeaturedFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='featured'>Featured</SelectItem>
                  <SelectItem value='not-featured'>Not Featured</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Input
                placeholder='Filter by category...'
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            {(searchQuery ||
              typeFilter !== 'all' ||
              publishedFilter !== 'all' ||
              verifiedFilter !== 'all' ||
              featuredFilter !== 'all' ||
              categoryFilter) && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setPublishedFilter('all');
                  setVerifiedFilter('all');
                  setFeaturedFilter('all');
                  setCategoryFilter('');
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>

          <AdminProfilesDataTable
            data={profiles}
            loading={loading}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />

          {/* Pagination */}
          {total > pageSize && (
            <div className='mt-4 flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, total)} of {total} profiles
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className='text-sm'>
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Profile Dialog */}
      <Dialog open={deleteProfileOpen} onOpenChange={setDeleteProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this profile? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <Alert>
              <AlertDescription>
                <div className='space-y-2'>
                  <p>
                    <strong>Profile:</strong> {selectedProfile.displayName}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedProfile.email}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    This will also delete all associated services and reviews.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDeleteProfile}>
              Delete Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Services Dialog */}
      <Dialog open={viewServicesOpen} onOpenChange={setViewServicesOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Profile Services</DialogTitle>
            <DialogDescription>
              Services offered by {selectedProfile?.displayName}
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Total Services: {selectedProfile._count.services}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Total Reviews: {selectedProfile._count.reviews}
                  </p>
                </div>
                <Badge variant='outline'>
                  Rating: {selectedProfile.rating.toFixed(1)} ⭐
                </Badge>
              </div>

              <Alert>
                <AlertDescription>
                  Services management is available in the Services section of the
                  admin panel.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setViewServicesOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
