import React, { JSX } from 'react';
import { notFound } from 'next/navigation';
import { getProfilePageData, getProfileMetadata } from '@/actions/profiles/get-profile';
import {
  ProfileBio,
  ProfileFeatures,
  ProfileIndustries,
  ProfileInfo,
  ProfileMeta,
  ProfileMetrics,
  ProfilePortfolio,
  ProfileSkills,
  ProfileTerms,
  TaxonomyTabs,
  DynamicBreadcrumb,
} from '@/components';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

// With prisma-json-types-generator, JSON fields are already properly typed
// We can use the PrismaJson namespace types directly


/**
 * Main profile page component
 * Renders a complete profile view with meta information, metrics, and skills
 * @param params - Next.js route parameters containing username
 * @returns Promise resolving to the profile page JSX element
 */
export default async function ProfilePage({
  params,
}: ProfilePageProps): Promise<JSX.Element> {
  const { username } = await params;
  const result = await getProfilePageData(username);

  // Type-safe data validation
  if (!result.success || !result.data) {
    notFound();
  }

  const {
    profile,
    category,
    subcategory,
    speciality,
    featuredCategories,
    skillsData,
    specialityData,
    contactMethodsData,
    paymentMethodsData,
    settlementMethodsData,
    budgetData,
    sizeData,
    industriesData,
    coverage,
    visibility,
    socials,
    calculatedExperience,
    breadcrumbSegments,
    breadcrumbButtons,
  } = result.data;

  const image = profile.image;

  return (
    <div className='my-20'>
      {/* Category Navigation Tabs */}
      <TaxonomyTabs
        items={featuredCategories}
        basePath={profile.user.role === 'freelancer' ? 'pros' : 'companies'}
        allItemsLabel={
          profile.user.role === 'freelancer'
            ? 'Όλοι οι Επαγγελματίες'
            : 'Όλες οι Επιχειρήσεις'
        }
        activeItemSlug={category?.slug}
        usePluralLabels={profile.user.role === 'freelancer'}
      />

      {/* Breadcrumb Navigation */}
      <DynamicBreadcrumb
        segments={breadcrumbSegments}
        buttons={breadcrumbButtons}
      />
      {/* Profile Content */}
      <section className='pt-4 pb-20 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='relative grid grid-cols-1 lg:grid-cols-3 gap-28'>
            {/* Main Content */}
            <div className='lg:col-span-2 space-y-12'>
              {/* Profile Header */}
              <ProfileMeta
                displayName={profile.displayName || ''}
                firstName={profile.firstName}
                lastName={profile.lastName}
                tagline={profile.tagline}
                image={image}
                rating={profile.rating}
                reviewCount={profile.reviewCount}
                verified={profile.verified}
                top={profile.top}
                coverage={coverage}
                visibility={visibility}
                socials={socials}
              />

              {/* Profile Metrics */}
              <ProfileMetrics
                subcategory={subcategory}
                servicesCount={undefined} // TODO: Get actual services count - set to undefined to hide for now
                commencement={profile.commencement}
                experience={calculatedExperience}
              />
              <ProfileBio bio={profile.bio} />
              <ProfileFeatures
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
              <ProfileIndustries
                industries={industriesData.map((industry) => industry.label)}
              />
              <ProfilePortfolio portfolio={profile.portfolio} />
              <ProfileTerms terms={profile.terms} />

              {/* Mobile Sidebar - Skills shown on mobile */}
              <div className='lg:hidden mb-8'>
                <div className='space-y-6'>
                  <ProfileInfo
                    rate={profile.rate}
                    coverage={coverage}
                    commencement={profile.commencement}
                    website={profile.website}
                    phone={profile.phone}
                    viber={profile.viber}
                    whatsapp={profile.whatsapp}
                    email={profile.email || profile.user.email}
                    visibility={visibility}
                    isOwner={false}
                  />

                  {(skillsData.length > 0 || speciality) && (
                    <ProfileSkills
                      skills={skillsData}
                      speciality={specialityData?.label}
                    />
                  )}
                </div>
              </div>

              {/* TODO: Add other profile sections here */}
              {/* - Featured Services */}
              {/* - Reviews */}
            </div>

            {/* Desktop Sidebar - Hidden on mobile */}
            <div className='hidden lg:block space-y-6 sticky top-2 self-start'>
              <ProfileInfo
                rate={profile.rate}
                coverage={coverage}
                commencement={profile.commencement}
                website={profile.website}
                phone={profile.phone}
                viber={profile.viber}
                whatsapp={profile.whatsapp}
                email={profile.email || profile.user.email}
                visibility={visibility}
                isOwner={false}
              />

              {(skillsData.length > 0 || speciality) && (
                <ProfileSkills
                  skills={skillsData}
                  speciality={specialityData?.label}
                />
              )}

              {/* TODO: Add other sidebar widgets */}
              {/* - Contact form */}
              {/* - Saved profiles */}
              {/* - Similar profiles */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Generates Next.js metadata for SEO optimization
 * Creates dynamic title, description, and OpenGraph data based on profile
 */
export async function generateMetadata({
  params,
}: ProfilePageProps) {
  const { username } = await params;
  return getProfileMetadata(username);
}
