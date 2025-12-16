import { getCurrentUser } from '@/actions/auth/server';
import { getService } from '@/actions/admin/services';
import { redirect, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  EditServiceBasicForm,
  EditServiceTaxonomyForm,
  EditServicePricingForm,
  EditServiceSettingsForm,
  EditServiceAddonsForm,
  EditServiceFaqForm,
  EditServiceMediaForm,
} from '@/components/admin/forms';
import { SiteHeader } from '@/components/admin';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { NextLink } from '@/components';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminServiceDetailPage({ params }: PageProps) {
  // Verify admin authentication
  const userResult = await getCurrentUser({ revalidate: true });

  if (!userResult.success || !userResult.data.user) {
    redirect('/login');
  }

  const { user: currentUser } = userResult.data;

  if (currentUser.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get service ID from params
  const { id } = await params;
  const serviceId = parseInt(id);

  if (isNaN(serviceId)) {
    redirect('/admin/services');
  }

  // Fetch the service
  const serviceResult = await getService(serviceId);

  if (!serviceResult.success || !serviceResult.data) {
    notFound();
  }

  const service = serviceResult.data as any;

  // Resolve taxonomy labels
  const categoryData = serviceTaxonomies.find(
    (cat) => cat.id === service.category,
  );
  const subcategoryData = categoryData?.children?.find(
    (sub) => sub.id === service.subcategory,
  );
  const subdivisionData = subcategoryData?.children?.find(
    (div) => div.id === service.subdivision,
  );

  const categoryLabel = categoryData?.label || service.category;
  const subcategoryLabel = subcategoryData?.label || service.subcategory;
  const subdivisionLabel = subdivisionData?.label || service.subdivision;

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      draft: 'outline',
      pending: 'secondary',
      published: 'default',
      approved: 'default',
      rejected: 'destructive',
      inactive: 'outline',
    };
    return variants[status] || 'outline';
  };

  return (
    <>
      <SiteHeader
        title={service.title || 'Service Details'}
        actions={
          <>
            <Button variant='ghost' size='sm' asChild>
              <NextLink href='/admin/services'>
                <ArrowLeft className='h-4 w-4' />
                Services
              </NextLink>
            </Button>
            <Button variant='outline' size='sm' asChild>
              <NextLink href={`/admin/profiles/${service.profile.id}`}>
                <ExternalLink className='h-4 w-4' />
                Profile
              </NextLink>
            </Button>
            <Button variant='outline' size='sm' asChild>
              <NextLink href={`/s/${service.slug}`} target='_blank'>
                <Eye className='h-4 w-4' />
                Public View
              </NextLink>
            </Button>
          </>
        }
      />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <div className='space-y-6 pb-16'>
            {/* Service Overview - 4 Tables */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {/* Service Information */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm'>
                    Πληροφορίες Υπηρεσίας
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='divide-y'>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Service ID
                      </span>
                      <span className='text-xs font-mono'>{service.id}</span>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Category
                      </span>
                      <span className='text-xs font-medium'>
                        {categoryLabel}
                      </span>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Subcategory
                      </span>
                      <span className='text-xs font-medium'>
                        {subcategoryLabel}
                      </span>
                    </div>
                    {service.subdivision && (
                      <div className='flex items-center justify-between px-6 py-2'>
                        <span className='text-xs text-muted-foreground'>
                          Subdivision
                        </span>
                        <span className='text-xs font-medium'>
                          {subdivisionLabel}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Status & Flags */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm'>Status & Flags</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='divide-y'>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Status
                      </span>
                      <Badge
                        variant={getStatusBadge(service.status)}
                        className='text-xs h-5'
                      >
                        {service.status}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Featured
                      </span>
                      <Badge
                        variant={service.featured ? 'default' : 'outline'}
                        className='text-xs h-5'
                      >
                        {service.featured ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Fixed Price
                      </span>
                      <Badge
                        variant={service.fixed ? 'default' : 'outline'}
                        className='text-xs h-5'
                      >
                        {service.fixed ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Has Media
                      </span>
                      <Badge
                        variant={
                          service.media && service.media.length > 0
                            ? 'default'
                            : 'outline'
                        }
                        className='text-xs h-5'
                      >
                        {service.media && service.media.length > 0
                          ? 'Yes'
                          : 'No'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Duration */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm'>Pricing & Duration</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='divide-y'>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Price
                      </span>
                      <span className='text-xs font-medium'>
                        {service.fixed ? `€${service.price}` : 'Hidden'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Duration
                      </span>
                      <span className='text-xs font-medium'>
                        {service.duration ? `${service.duration} days` : 'N/A'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Subscription
                      </span>
                      <span className='text-xs font-medium'>
                        {service.subscriptionType || 'None'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Tags
                      </span>
                      <span className='text-xs font-medium'>
                        {service.tags?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity & Stats */}
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm'>Activity & Stats</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='divide-y'>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Reviews
                      </span>
                      <span className='text-xs font-medium'>
                        {service._count?.reviews || 0}
                      </span>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Rating
                      </span>
                      <span className='text-xs font-medium'>
                        {service.rating?.toFixed(1) || 'N/A'} ⭐
                      </span>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        FAQ Items
                      </span>
                      <span className='text-xs font-medium'>
                        {service.faq?.length || 0}
                      </span>
                    </div>
                    <div className='flex items-center justify-between px-6 py-2'>
                      <span className='text-xs text-muted-foreground'>
                        Addons
                      </span>
                      <span className='text-xs font-medium'>
                        {service.addons?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Management Forms - LAST SECTION */}
            <div className='mx-auto w-full max-w-5xl px-4 lg:px-6 space-y-6'>
              <div>
                <h2>Διαχείρηση Υπηρεσίας</h2>
              </div>

              <div className='space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditServiceSettingsForm service={service} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Πληροφορίες</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditServiceBasicForm service={service} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Κατηγορία & Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditServiceTaxonomyForm service={service} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      Pricing & Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditServicePricingForm service={service} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Addons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditServiceAddonsForm service={service} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Συχνές Ερωτήσεις</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditServiceFaqForm service={service} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditServiceMediaForm service={service} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
