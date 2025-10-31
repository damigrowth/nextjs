import type { JSX } from 'react';
import { notFound } from 'next/navigation';
import { getServicePageData } from '@/actions/services';
import { getServiceMetadata } from '@/lib/seo/pages';
import { TaxonomyTabs, DynamicBreadcrumb } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ServiceMeta,
  ServiceInfo,
  ServiceAbout,
  ServiceMedia,
  ServiceContact,
  ServiceOrderFixed,
  ServiceFAQ,
  ProfileTerms,
  ServiceRelated,
} from '@/components';

// ISR configuration with shorter interval + tag-based revalidation
export const revalidate = 300; // Revalidate every 5 minutes (backup for tag-based)
export const dynamicParams = true; // Allow new services to be generated on-demand

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generates Next.js metadata for SEO optimization
 * Creates dynamic title, description, and OpenGraph data based on service
 */
export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  return getServiceMetadata(slug);
}

// Generate static params for all published services
export async function generateStaticParams() {
  try {
    const { prisma } = await import('@/lib/prisma/client');
    const services = await prisma.service.findMany({
      where: {
        status: 'published',
        slug: { not: null }, // Ensure slug exists
      },
      select: { slug: true },
    });

    return services.map((service) => ({
      slug: service.slug!,
    }));
  } catch (error) {
    console.error('Error generating static params for services:', error);
    return [];
  }
}

export default async function ServicePage({
  params,
}: ServicePageProps): Promise<JSX.Element> {
  const { slug } = await params;

  // Fetch complete service page data
  const result = await getServicePageData(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const {
    service,
    category,
    subcategory,
    subdivision,
    profileSubcategory,
    coverage,
    featuredCategories,
    breadcrumbSegments,
    breadcrumbButtons,
    budgetData,
    sizeData,
    contactMethodsData,
    paymentMethodsData,
    settlementMethodsData,
    tagsData,
    relatedServices,
  } = result.data;

  return (
    <div className='py-20 bg-silver'>
      {/* Category Navigation Tabs */}
      <TaxonomyTabs
        items={featuredCategories}
        basePath='categories'
        allItemsLabel='Όλες οι Υπηρεσίες'
        activeItemSlug={category?.slug}
        usePluralLabels={false}
      />

      {/* Breadcrumb Navigation */}
      <DynamicBreadcrumb
        segments={breadcrumbSegments}
        buttons={breadcrumbButtons}
        className='bg-silver'
      />

      {/* Service Content */}
      <section className='pt-4'>
        <div className='container mx-auto px-4'>
          <div className='relative grid grid-cols-1 lg:grid-cols-3 gap-28'>
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Service Header Card */}
              <Card className='shadow-sm border'>
                <CardContent className='p-6'>
                  <ServiceMeta
                    title={service.title}
                    firstName={service.profile.firstName}
                    lastName={service.profile.lastName}
                    displayName={service.profile.displayName || ''}
                    username={service.profile.username || ''}
                    image={service.profile.image}
                    rating={service.profile.rating}
                    totalReviews={service.profile.reviewCount}
                    verified={service.profile.verified}
                    topLevel={service.profile.top}
                  />
                  <ServiceInfo
                    coverage={coverage}
                    category={category}
                    subcategory={subcategory}
                    subdivision={subdivision}
                    duration={service.duration}
                    type={service.type}
                    subscriptionType={service.subscriptionType}
                  />
                </CardContent>
              </Card>

              {/* Service About */}
              <ServiceAbout
                description={service.description}
                tags={tagsData.map((tag) => tag.label)}
                budget={budgetData?.label}
                size={sizeData?.label}
                contactMethods={contactMethodsData.map(
                  (method) => method.label,
                )}
                paymentMethods={paymentMethodsData.map(
                  (method) => method.label,
                )}
                settlementMethods={settlementMethodsData.map(
                  (method) => method.label,
                )}
              />

              {/* Service Media Gallery */}
              <ServiceMedia media={service.media} />

              {/* Service Order/Price Widget */}
              <ServiceOrderFixed
                price={service.price || 0}
                addons={service.addons || []}
                isOwner={false} // TODO: Check if current user is the owner
                compact={false}
                profileUserId={service.profile.uid}
                profileDisplayName={service.profile.displayName || ''}
                serviceTitle={service.title}
              />

              {/* Service FAQ */}
              <ServiceFAQ faqs={service.faq || []} />

              {/* Profile Terms */}
              <ProfileTerms terms={service.profile.terms} />
            </div>

            {/* Sidebar */}
            <div className='space-y-6 sticky top-2 self-start'>
              {/* Order/Price Widget */}
              <ServiceOrderFixed
                price={service.price || 0}
                addons={service.addons || []}
                isOwner={false} // TODO: Check if current user is the owner
                compact={true}
                profileUserId={service.profile.uid}
                profileDisplayName={service.profile.displayName || ''}
                serviceTitle={service.title}
              />

              {/* Contact Card */}
              <ServiceContact
                profile={service.profile}
                subcategory={profileSubcategory?.label}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Related Services Section */}
      <ServiceRelated
        services={relatedServices}
        categoryLabel={category?.label}
      />
    </div>
  );
}
