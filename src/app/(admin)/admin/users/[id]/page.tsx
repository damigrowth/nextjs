import { getCurrentUser } from '@/actions/auth/server';
import { getUser } from '@/actions/admin';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, ExternalLink, Shield, UserCog } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  EditUserBasicForm,
  EditUserStatusForm,
  EditUserBanForm,
  RevokeSessionsForm,
} from '@/components/admin/forms';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  // Verify admin authentication
  const userResult = await getCurrentUser({ revalidate: true });

  if (!userResult.success || !userResult.data.user) {
    redirect('/login');
  }

  const { user: currentUser } = userResult.data;

  if (currentUser.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get user ID from params
  const { id: userId } = await params;

  // Fetch the user
  const userDataResult = await getUser(userId);

  if (!userDataResult.success || !userDataResult.data) {
    notFound();
  }

  const user = userDataResult.data as any;

  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='px-4 lg:px-6'>
        <div className='space-y-6 pb-16'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <h1 className='text-3xl font-bold tracking-tight'>
                {user.name || user.email}
              </h1>
              <p className='text-muted-foreground'>
                Manage user account and profile settings
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/admin/users'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back to Users
                </Link>
              </Button>
              {user.profile && (
                <>
                  <Button variant='outline' size='sm' asChild>
                    <Link href={`/admin/profiles/${user.profile.id}`}>
                      <ExternalLink className='mr-2 h-4 w-4' />
                      Manage Profile
                    </Link>
                  </Button>
                  <Button variant='outline' size='sm' asChild>
                    <Link href={`/profile/${user.profile.username}`} target='_blank'>
                      <Eye className='mr-2 h-4 w-4' />
                      View Public Profile
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* User Overview - 4 Tables */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {/* Account Information */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm'>Account Information</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>User ID</span>
                    <span className='text-xs font-mono'>{user.id.slice(0, 12)}...</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Email</span>
                    <span className='text-xs font-medium truncate max-w-[140px]'>{user.email}</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Name</span>
                    <span className='text-xs font-medium'>{user.name || '-'}</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Username</span>
                    <span className='text-xs font-medium'>{user.username || '-'}</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Display Name</span>
                    <span className='text-xs font-medium'>{user.displayName || '-'}</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>First Name</span>
                    <span className='text-xs font-medium'>{user.firstName || '-'}</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Last Name</span>
                    <span className='text-xs font-medium'>{user.lastName || '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Security */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm'>Status & Security</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Role</span>
                    <Badge variant='outline' className='text-xs h-5'>
                      {user.role}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Type</span>
                    <Badge variant='outline' className='text-xs h-5'>
                      {user.type}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Provider</span>
                    <Badge variant='secondary' className='text-xs h-5'>
                      {user.provider}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Step</span>
                    <Badge variant='secondary' className='text-xs h-5'>
                      {user.step}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Email Verified</span>
                    <Badge variant={user.emailVerified ? 'default' : 'outline'} className='text-xs h-5'>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Confirmed</span>
                    <Badge variant={user.confirmed ? 'default' : 'outline'} className='text-xs h-5'>
                      {user.confirmed ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Blocked</span>
                    <Badge variant={user.blocked ? 'destructive' : 'outline'} className='text-xs h-5'>
                      {user.blocked ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ban Information */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm'>Ban Information</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Banned</span>
                    <Badge variant={user.banned ? 'destructive' : 'outline'} className='text-xs h-5'>
                      {user.banned ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className='flex flex-col gap-1 px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Ban Reason</span>
                    <span className='text-xs font-medium'>
                      {user.banReason || '-'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Ban Expires</span>
                    <span className='text-xs font-medium'>
                      {user.banExpires ? formatDateTime(user.banExpires) : '-'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Image</span>
                    <span className='text-xs font-medium'>
                      {user.image ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Active Sessions</span>
                    <span className='text-xs font-medium'>{user.sessions?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile & Activity */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm'>Profile & Activity</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Has Profile</span>
                    <Badge variant={user.profile ? 'default' : 'outline'} className='text-xs h-5'>
                      {user.profile ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {user.profile && (
                    <>
                      <div className='flex items-center justify-between px-6 py-2'>
                        <span className='text-xs text-muted-foreground'>Services</span>
                        <span className='text-xs font-medium'>{user.profile._count?.services || 0}</span>
                      </div>
                      <div className='flex items-center justify-between px-6 py-2'>
                        <span className='text-xs text-muted-foreground'>Reviews</span>
                        <span className='text-xs font-medium'>{user.profile._count?.reviews || 0}</span>
                      </div>
                    </>
                  )}
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Connected Accounts</span>
                    <span className='text-xs font-medium'>{user.accounts?.length || 0}</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Created</span>
                    <span className='text-xs font-medium'>
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Updated</span>
                    <span className='text-xs font-medium'>
                      {formatDate(user.updatedAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information Sections */}
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  Active Sessions ({user.sessions?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.sessions && user.sessions.length > 0 ? (
                  <div className='space-y-3'>
                    {user.sessions.map((session: any) => (
                      <div key={session.id} className='rounded-lg border p-3 space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>Session ID</span>
                          <span className='text-xs font-mono'>{session.id.slice(0, 12)}...</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-muted-foreground'>Created</span>
                          <span className='text-xs'>{formatDateTime(session.createdAt)}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-muted-foreground'>Expires</span>
                          <span className='text-xs'>{formatDateTime(session.expiresAt)}</span>
                        </div>
                        {session.ipAddress && (
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-muted-foreground'>IP Address</span>
                            <span className='text-xs font-mono'>{session.ipAddress}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>No active sessions</p>
                )}
              </CardContent>
            </Card>

            {/* Accounts (OAuth providers) */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <UserCog className='h-5 w-5' />
                  Connected Accounts ({user.accounts?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.accounts && user.accounts.length > 0 ? (
                  <div className='space-y-3'>
                    {user.accounts.map((account: any) => (
                      <div key={account.id} className='rounded-lg border p-3 space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>Provider</span>
                          <Badge variant='outline'>{account.providerId}</Badge>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-muted-foreground'>Account ID</span>
                          <span className='text-xs font-mono'>{account.accountId}</span>
                        </div>
                        {account.createdAt && (
                          <div className='flex items-center justify-between'>
                            <span className='text-sm text-muted-foreground'>Connected</span>
                            <span className='text-xs'>{formatDateTime(account.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>No connected accounts</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Management Forms - LAST SECTION */}
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-bold'>User Management</h2>
              <p className='text-muted-foreground'>
                Edit user information, manage account status, and control access
              </p>
            </div>

            <Accordion type='multiple' className='w-full'>
              <AccordionItem value='basic-info'>
                <AccordionTrigger>
                  <div className='flex flex-col items-start text-left'>
                    <span className='font-semibold'>Basic Information</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      Update user's basic account information
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className='pt-6'>
                      <EditUserBasicForm user={user} />
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='status'>
                <AccordionTrigger>
                  <div className='flex flex-col items-start text-left'>
                    <span className='font-semibold'>Account Status & Role</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      Manage user role, type, verification status, and account flags
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className='pt-6'>
                      <EditUserStatusForm user={user} />
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='ban'>
                <AccordionTrigger>
                  <div className='flex flex-col items-start text-left'>
                    <span className='font-semibold'>Ban Management</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      Ban or unban users with optional reason and expiration
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className='pt-6'>
                      <EditUserBanForm user={user} />
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='sessions'>
                <AccordionTrigger>
                  <div className='flex flex-col items-start text-left'>
                    <span className='font-semibold'>Session Management</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      Revoke all active sessions to force user logout
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className='pt-6'>
                      <RevokeSessionsForm user={user} />
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

        </div>
      </div>
    </div>
  );
}
