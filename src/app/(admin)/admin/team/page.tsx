import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldIcon,
  Headphones,
  Pencil,
  MailIcon,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import UserAvatar from '@/components/shared/user-avatar';
import { SiteHeader } from '@/components/admin/site-header';
import { getTeamMembers } from '@/actions/admin/users';
import { TeamManagementClient } from '@/components/admin/team/team-management-client';
import { ADMIN_ROLES } from '@/lib/auth/roles';
import { formatDateTime } from '@/lib/utils/date';
import { requirePermission } from '@/actions/auth/server';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  // Require admin-only access
  await requirePermission(ADMIN_RESOURCES.TEAM);

  // Fetch team members
  const result = await getTeamMembers();
  const teamMembers = result.success ? result.data : [];

  // Calculate stats
  const totalMembers = teamMembers.length;
  const adminCount = teamMembers.filter(
    (m) => m.role === ADMIN_ROLES.ADMIN,
  ).length;
  const supportCount = teamMembers.filter(
    (m) => m.role === ADMIN_ROLES.SUPPORT,
  ).length;
  const editorCount = teamMembers.filter(
    (m) => m.role === ADMIN_ROLES.EDITOR,
  ).length;

  // Helper to get role icon
  const getRoleIcon = (role: string) => {
    if (role === ADMIN_ROLES.ADMIN) return ShieldIcon;
    if (role === ADMIN_ROLES.SUPPORT) return Headphones;
    if (role === ADMIN_ROLES.EDITOR) return Pencil;
    return null;
  };

  // Helper to get role display name
  const getRoleDisplayName = (role: string) => {
    if (role === ADMIN_ROLES.ADMIN) return 'Admin';
    if (role === ADMIN_ROLES.SUPPORT) return 'Support';
    if (role === ADMIN_ROLES.EDITOR) return 'Editor';
    return role;
  };

  return (
    <>
      <SiteHeader title='Team' actions={<TeamManagementClient />} />

      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        {/* Stats Cards */}
        <div className='px-4 lg:px-6'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{totalMembers}</div>
                <p className='text-xs text-muted-foreground'>
                  Active administrators
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{adminCount}</div>
                <p className='text-xs text-muted-foreground'>
                  Full access level
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{supportCount}</div>
                <p className='text-xs text-muted-foreground'>Limited access</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Editors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{editorCount}</div>
                <p className='text-xs text-muted-foreground'>
                  Content management
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className='px-4 lg:px-6'>
          {teamMembers.length === 0 ? (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-10'>
                <p className='text-muted-foreground'>No team members found</p>
                <p className='text-sm text-muted-foreground'>
                  Click "Add Team Member" to assign admin roles
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {teamMembers.map((member) => {
                const RoleIcon = getRoleIcon(member.role);

                return (
                  <Card key={member.id} className="relative">
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center space-x-3'>
                          <UserAvatar
                            displayName={member.displayName}
                            image={member.image}
                            size='md'
                            className='h-12 w-12'
                            showBorder={false}
                            showShadow={false}
                          />
                          <div>
                            <div className='flex items-center gap-2'>
                              <div className="space-y-0.5">
                                <CardTitle className='text-base'>
                                  {member.displayName || 'No name'}
                                </CardTitle>
                                {member.username && (
                                  <p className='text-xs text-muted-foreground'>
                                    @{member.username}
                                  </p>
                                )}
                              </div>
                              {RoleIcon && <RoleIcon className='h-4 w-4' />}
                            </div>
                            <p className='text-sm text-muted-foreground mt-1'>
                              {getRoleDisplayName(member.role)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline">
                            {getRoleDisplayName(member.role)}
                          </Badge>
                          {member.blocked && (
                            <Badge variant='destructive' className='text-xs'>
                              Blocked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      {/* Email */}
                      <div className='space-y-1 text-sm'>
                        <div className='flex items-center gap-2'>
                          <MailIcon className='h-3 w-3 text-muted-foreground' />
                          <span className='text-muted-foreground truncate'>
                            {member.email}
                          </span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className='text-xs text-muted-foreground space-y-1'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-3 w-3' />
                          <span>
                            Joined: {formatDateTime(member.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                        asChild
                      >
                        <Link href={`/admin/users/${member.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
