'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ProfileBadges, UserAvatar } from '@/components/shared';
import { Star, Copy, Check } from 'lucide-react';
import TaxonomiesDisplay from '@/components/shared/taxonomies-display';
import { formatDate, formatTime } from '@/lib/utils/date';
import { AdminDataTable, ColumnDef } from './admin-data-table';
import type { AdminProfileWithRelations } from '@/lib/types/auth';

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

interface AdminProfilesDataTableProps {
  data: AdminProfileWithRelations[];
  loading?: boolean;
  basePath?: string;
}

export function AdminProfilesDataTable({
  data,
  loading = false,
  basePath = '/admin/profiles',
}: AdminProfilesDataTableProps) {
  // Helper functions
  const getTypeBadgeVariant = (type: string | null) => {
    return 'outline' as const;
  };


  // Column definitions
  const columns: ColumnDef<AdminProfileWithRelations>[] = [
    {
      key: 'displayName',
      header: 'Profile',
      sortable: true,
      render: (profile) => {
        const displayName = profile.displayName || profile.user.name || 'Unknown';
        const email = profile.email || profile.user.email;

        return (
          <div className='flex items-center gap-3'>
            <UserAvatar
              displayName={displayName}
              image={profile.image}
              size='md'
              className='h-10 w-10'
              showBorder={false}
              showShadow={false}
            />
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
      key: 'relatedUser',
      header: 'Related User',
      render: (profile) => {
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
      key: 'type',
      header: 'Role',
      render: (profile) => {
        if (!profile.type) return <Badge variant='outline'>N/A</Badge>;

        return (
          <Badge variant={getTypeBadgeVariant(profile.type)}>
            {profile.type.charAt(0).toUpperCase() + profile.type.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (profile) => {
        if (!profile.taxonomyLabels) {
          return <span className='text-muted-foreground text-sm'>-</span>;
        }

        return (
          <TaxonomiesDisplay
            taxonomyLabels={profile.taxonomyLabels}
            compact
          />
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (profile) => (
        <ProfileBadges
          featured={profile.featured}
          verified={profile.verified}
          topLevel={profile.top}
        />
      ),
    },
    {
      key: 'services',
      header: 'Services',
      sortable: true,
      render: (profile) => (
        <div className='text-sm font-medium'>
          {profile._count.services}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (profile) => (
        <div className='text-sm text-muted-foreground'>
          <div>{formatDate(profile.createdAt)}</div>
          <div className='text-xs'>{formatTime(profile.createdAt)}</div>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (profile) => (
        <div className='text-sm text-muted-foreground'>
          <div>{formatDate(profile.updatedAt)}</div>
          <div className='text-xs'>{formatTime(profile.updatedAt)}</div>
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
      editPath={(profile) => `${basePath}/${profile.id}`}
      emptyMessage='No profiles found matching your criteria.'
    />
  );
}
