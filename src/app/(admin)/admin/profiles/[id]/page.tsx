import { getCurrentUser } from '@/actions/auth/server';
import { getProfile } from '@/actions/admin/profiles';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BasicInfoForm,
  AdditionalInfoForm,
  PresentationInfoForm,
  PortfolioForm,
  BillingForm,
} from '@/components';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProfileEditPage({ params }: PageProps) {
  // Verify admin authentication
  const userResult = await getCurrentUser({ revalidate: true });

  if (!userResult.success || !userResult.data.user) {
    redirect('/login');
  }

  const { user: currentUser } = userResult.data;

  if (currentUser.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get profile ID from params
  const { id: profileId } = await params;

  // Fetch the profile
  const profileResult = await getProfile(profileId);

  if (!profileResult.success || !profileResult.data) {
    notFound();
  }

  const profile = profileResult.data as any;

  // Create a mock user object for the forms (they expect AuthUser)
  const mockUser = {
    id: profile.uid,
    email: profile.user.email,
    name: profile.user.name || profile.displayName,
    role: profile.user.role,
    step: profile.user.step || 'DASHBOARD',
    emailVerified: true,
    banned: profile.user.banned,
    blocked: profile.user.blocked,
    createdAt: profile.user.createdAt || profile.createdAt,
    updatedAt: profile.user.updatedAt || profile.updatedAt,
  };

  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='px-4 lg:px-6'>
        <div className='space-y-6 pb-16'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <h1 className='text-3xl font-bold tracking-tight'>
                {profile.displayName || profile.username || 'Unnamed'}
              </h1>
              <p className='text-muted-foreground'>
                Manage all aspects of this professional profile
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/admin/profiles'>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Back to Profiles
                </Link>
              </Button>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/admin/users/${profile.uid}`}>
                  <ExternalLink className='mr-2 h-4 w-4' />
                  Manage User Account
                </Link>
              </Button>
              <Button variant='outline' size='sm' asChild>
                <Link href={`/profile/${profile.username}`} target='_blank'>
                  <Eye className='mr-2 h-4 w-4' />
                  View Public Profile
                </Link>
              </Button>
            </div>
          </div>

          {/* Profile Overview - 3 Tables */}
          <div className='grid gap-4 md:grid-cols-3'>
            {/* Profile Information Table */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm'>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Display Name</span>
                    <span className='text-xs font-medium'>{profile.displayName || '-'}</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Username</span>
                    <span className='text-xs font-medium'>{profile.username || '-'}</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Type</span>
                    <Badge variant='outline' className='text-xs h-5'>
                      {profile.type || 'Not Set'}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>UID</span>
                    <span className='text-xs font-mono'>{profile.uid.slice(0, 8)}...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Flags Table */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm'>Status Flags</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Published</span>
                    <Badge variant={profile.published ? 'default' : 'outline'} className='text-xs h-5'>
                      {profile.published ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Featured</span>
                    <Badge variant={profile.featured ? 'default' : 'outline'} className='text-xs h-5'>
                      {profile.featured ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Verified</span>
                    <Badge variant={profile.verified ? 'default' : 'outline'} className='text-xs h-5'>
                      {profile.verified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Top Level</span>
                    <Badge variant={profile.top ? 'default' : 'outline'} className='text-xs h-5'>
                      {profile.top ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Active</span>
                    <Badge variant={profile.isActive ? 'default' : 'outline'} className='text-xs h-5'>
                      {profile.isActive ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics & Dates Table */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm'>Statistics & Dates</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y'>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Services</span>
                    <span className='text-xs font-medium'>{profile._count?.services || 0}</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Reviews</span>
                    <span className='text-xs font-medium'>{profile.reviewCount || 0}</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Rating</span>
                    <span className='text-xs font-medium'>{profile.rating?.toFixed(1) || 'N/A'} ⭐</span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Created</span>
                    <span className='text-xs font-medium'>
                      {new Date(profile.createdAt).toLocaleDateString('el-GR')}
                    </span>
                  </div>
                  <div className='flex items-center justify-between px-6 py-2'>
                    <span className='text-xs text-muted-foreground'>Updated</span>
                    <span className='text-xs font-medium'>
                      {new Date(profile.updatedAt).toLocaleDateString('el-GR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Management Forms */}
          <div className='space-y-6'>
            <div>
              <h2 className='text-2xl font-bold'>Profile Management</h2>
              <p className='text-muted-foreground'>
                Edit profile information, presentation, portfolio, and billing details
              </p>
            </div>

            <Accordion type='multiple' className='w-full'>
              <AccordionItem value='basic'>
                <AccordionTrigger>
                  <div className='flex flex-col items-start text-left'>
                    <span className='font-semibold'>Βασικά στοιχεία</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      Εικόνα προφίλ, tagline, κατηγορία, υποκατηγορία, τοποθεσία, περιοχές κάλυψης, ειδικότητα, δεξιότητες, bio
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <BasicInfoForm initialUser={mockUser as any} initialProfile={profile} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='additional'>
                <AccordionTrigger>
                  <div className='flex flex-col items-start text-left'>
                    <span className='font-semibold'>Πρόσθετα Στοιχεία</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      Έναρξη δραστηριότητας, ωριαία αμοιβή, μέθοδοι επικοινωνίας, μέθοδοι πληρωμής, μέθοδοι διακανονισμού, ελάχιστος προϋπολογισμός, κλάδοι δραστηριότητας, όροι συνεργασίας
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <AdditionalInfoForm initialUser={mockUser as any} initialProfile={profile} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='presentation'>
                <AccordionTrigger>
                  <div className='flex flex-col items-start text-left'>
                    <span className='font-semibold'>Παρουσίαση</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      Τηλέφωνο, ιστοσελίδα, ορατότητα στοιχείων, μέσα κοινωνικής δικτύωσης
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <PresentationInfoForm initialUser={mockUser as any} initialProfile={profile} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='portfolio'>
                <AccordionTrigger>
                  <div className='flex flex-col items-start text-left'>
                    <span className='font-semibold'>Portfolio</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      Εικόνες και βίντεο χαρτοφυλακίου
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <PortfolioForm
                    initialUser={mockUser as any}
                    initialProfile={profile}
                    showHeading={false}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='billing'>
                <AccordionTrigger>
                  <div className='flex flex-col items-start text-left'>
                    <span className='font-semibold'>Στοιχεία Τιμολόγησης</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      Τύπος παραστατικού, ΑΦΜ, ΔΟΥ, επωνυμία, επάγγελμα, διεύθυνση τιμολόγησης
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <BillingForm initialUser={mockUser as any} initialProfile={profile} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
