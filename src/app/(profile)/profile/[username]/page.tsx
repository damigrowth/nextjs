import React, { JSX } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';

import {
  findById,
  transformCoverageWithLocationNames,
  getDefaultCoverage,
} from '@/lib/utils/datasets';
import { skills } from '@/constants/datasets/skills';
import {
  contactMethodsOptions,
  paymentMethodsOptions,
  settlementMethodsOptions,
  budgetOptions,
  sizeOptions,
} from '@/constants/datasets/options';
import { industriesOptions } from '@/constants/datasets/industries';
import { locationOptions } from '@/constants/datasets/locations';
import {
  ProfileBio,
  ProfileBreadcrumb,
  ProfileFeatures,
  ProfileIndustries,
  ProfileInfo,
  ProfileMeta,
  ProfileMetrics,
  ProfilePortfolio,
  ProfileSkills,
  ProfileTerms,
  TaxonomyTabs,
} from '@/components';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

// With prisma-json-types-generator, JSON fields are already properly typed
// We can use the PrismaJson namespace types directly

/**
 * Retrieves a profile by username with associated user data
 * Uses Prisma client with proper type inference from schema
 * @param username - The unique username to search for
 * @returns Promise resolving to profile with user relation or null if not found
 */
const getProfile = async (username: string) => {
  try {
    const result = await prisma.profile.findFirst({
      where: {
        username,
        published: true,
      },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            confirmed: true,
            blocked: true,
            email: true,
          },
        },
      },
    });

    // Return the properly typed Prisma result
    return result;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

// Note: Using findById from @/lib/utils/datasets instead of local function

/**
 * Retrieves complete profile data with resolved taxonomy information
 * Validates user permissions and resolves category/subcategory data
 * @param username - The username to fetch profile data for
 * @returns Promise resolving to profile data with taxonomy info or null if invalid
 */
async function getProfileData(username: string) {
  const profile = await getProfile(username);

  // Early validation with proper null checks
  if (!profile || profile.user.blocked || !profile.user.confirmed) {
    return null;
  }

  // Simple role validation
  if (!['freelancer', 'company'].includes(profile.user.role)) {
    return null;
  }

  // Use proTaxonomies for all profiles, filtering by type based on user role
  const category = profile.category
    ? findById(proTaxonomies, profile.category)
    : null;

  const subcategory =
    profile.subcategory && category?.children
      ? findById(category.children, profile.subcategory)
      : null;

  const speciality = profile.speciality
    ? findById(proTaxonomies, profile.speciality)
    : null;

  const featuredCategories = proTaxonomies.slice(0, 8);

  return {
    profile,
    category: category || undefined,
    subcategory: subcategory || undefined,
    speciality: speciality || undefined,
    featuredCategories,
  };
}

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
  const data = await getProfileData(username);

  // Type-safe data validation
  if (!data) {
    notFound();
  }

  const { profile, category, subcategory, speciality, featuredCategories } =
    data;

  // Use proTaxonomies for skills resolution - skills are in the same taxonomy
  const skillsData = profile.skills
    .map((skillId) => findById(skills, skillId))
    .filter((skill) => skill !== null);

  const specialityData = findById(skills, profile.speciality);

  // Resolve dataset options for features
  const contactMethodsData = profile.contactMethods
    .map((methodId) => findById(contactMethodsOptions, methodId))
    .filter((method) => method !== null);

  const paymentMethodsData = profile.paymentMethods
    .map((methodId) => findById(paymentMethodsOptions, methodId))
    .filter((method) => method !== null);

  const settlementMethodsData = profile.settlementMethods
    .map((methodId) => findById(settlementMethodsOptions, methodId))
    .filter((method) => method !== null);

  const budgetData = profile.budget
    ? findById(budgetOptions, profile.budget)
    : null;

  const sizeData = profile.size ? findById(sizeOptions, profile.size) : null;

  const industriesData = profile.industries
    .map((industryId) => findById(industriesOptions, industryId))
    .filter((industry) => industry !== null);

  // Transform coverage data by resolving all location IDs to names
  const rawCoverage = profile.coverage || getDefaultCoverage();
  const coverage = transformCoverageWithLocationNames(
    rawCoverage,
    locationOptions,
  );

  const visibility = profile.visibility || {
    email: true,
    phone: true,
    address: true,
  };
  const socials = profile.socials || {};
  const image = profile.image;

  // console.log(profile.coverage);

  // Use the profile.experience field directly as it's already stored as an integer
  const calculatedExperience = profile.experience || 0;

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
      <ProfileBreadcrumb
        profile={{
          id: profile.id,
          username: profile.username || '',
          displayName: profile.displayName || '',
          role: profile.user.role,
        }}
        category={category}
        subcategory={subcategory}
        savedStatus={false}
        hideSaveButton={false}
        isAuthenticated={true}
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

// Type-safe metadata return interface
interface ProfileMetadata {
  title: string;
  description: string;
  openGraph?: {
    title: string;
    description: string;
    images: string[];
  };
}

/**
 * Generates Next.js metadata for SEO optimization
 * Creates dynamic title, description, and OpenGraph data based on profile
 * @param params - Next.js route parameters containing username
 * @returns Promise resolving to metadata object for page head
 */
export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<ProfileMetadata> {
  const { username } = await params;
  const data = await getProfileData(username);

  // Type-safe early return for not found profiles
  if (!data) {
    return {
      title: 'Profile Not Found',
      description: 'The requested profile could not be found.',
    };
  }

  const { profile, category } = data;

  // Simple role label
  const roleLabel =
    profile.user.role === 'freelancer'
      ? 'Επαγγελματίας'
      : profile.user.role === 'company'
        ? 'Επιχείρηση'
        : 'Χρήστης';

  // Type-safe image for OpenGraph - now handles both string URLs and CloudinaryResource objects
  const imageUrls: string[] = profile.image
    ? typeof profile.image === 'string'
      ? [profile.image]
      : (profile.image as any)?.secure_url
        ? [(profile.image as any).secure_url]
        : []
    : [];

  return {
    title: `${profile.displayName || profile.username || 'Unknown'} - ${roleLabel}${category ? ` | ${category.label}` : ''}`,
    description: `${profile.tagline || `${roleLabel} profile για τον/την ${profile.displayName || profile.username}`}${category ? ` στην κατηγορία ${category.label}` : ''}.`,
    openGraph: {
      title: profile.displayName || profile.username || 'Unknown Profile',
      description: profile.tagline || `${roleLabel} profile`,
      images: imageUrls,
    },
  };
}
