import { redirect } from 'next/navigation';

import {
  getFeaturedServicesByFreelancer,
  getFreelancer,
  getFreelancerByUsername,
  // getFreelancerId,
  getReviewsByFreelancer,
  getSavedStatus,
} from '@/actions';
import { ProfileBreadcrumb } from '@/components/breadcrumb';
import { FreelancerProfile } from '@/components/content';
import { Tabs } from '@/components/section';
import { getData } from '@/lib/client/operations';
import { FREELANCER_CATEGORIES } from '@/lib/graphql';
import { Meta } from '@/utils/Seo/Meta/Meta';

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

export const dynamicParams = true;

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { username } = await params;

  const data = {
    type: 'freelancer',
    params: { username },
    titleTemplate: '%displayName% - %type% - %category%. %tagline%',
    descriptionTemplate: '%description%',
    size: 160,
    url: `/profile/${username}`,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { username } = await params;

  const { services: searchParmasServices, reviews: searchParmasReviews } =
    await searchParams;

  const currentFreelancer = await getFreelancer();

  const fid = currentFreelancer?.id;

  const freelancerDisplayName = currentFreelancer?.displayName;

  const freelancerUsername = currentFreelancer?.username;

  const freelancerEmail = currentFreelancer?.email;

  const { freelancer } = await getFreelancerByUsername(username);

  if (!freelancer || freelancer.image.data === null) {
    redirect('/not-found');
  } else {
    const freelancerId = freelancer?.id;

    let servicesPage = parseInt(searchParmasServices, 10);

    servicesPage = !servicesPage || servicesPage < 1 ? 1 : servicesPage;

    const servicesPageSize = servicesPage * 3;

    let reviewsPage = parseInt(searchParmasReviews, 10);

    reviewsPage = !reviewsPage || reviewsPage < 1 ? 1 : reviewsPage;

    const reviewsPageSize = reviewsPage * 3;

    const { reviews, reviewsMeta } = await getReviewsByFreelancer(
      freelancerId,
      1,
      reviewsPageSize,
    );

    const { services, servicesMeta } = await getFeaturedServicesByFreelancer(
      freelancerId,
      servicesPageSize,
    );

    const type = freelancer?.type?.data?.attributes?.slug;

    const { categories } = await getData(FREELANCER_CATEGORIES);

    const emailSubjectTitle = `${freelancer?.displayName} ${
      freelancer?.type?.data?.attributes?.label
    } ${freelancer?.subcategory?.data ? freelancer?.subcategory?.data?.attributes?.label : ''}`;

    let savedStatus = null;

    if (fid !== freelancerId) {
      savedStatus = await getSavedStatus('freelancer', freelancerId);
    }

    return (
      <>
        <Tabs
          type={type}
          categories={categories?.data}
          freelancerCategory={freelancer?.category?.data?.attributes?.slug}
        />
        <ProfileBreadcrumb
          category={freelancer?.category}
          type={type}
          subcategory={freelancer?.subcategory}
          subjectTitle={emailSubjectTitle}
          id={freelancerId}
          savedStatus={savedStatus}
          hideSaveButton={fid === freelancerId}
          isAuthenticated={fid ? true : false}
        />
        <FreelancerProfile
          fid={fid}
          freelancerDisplayName={freelancerDisplayName}
          freelancerUsername={freelancerUsername}
          freelancerEmail={freelancerEmail}
          freelancerId={freelancerId}
          username={username}
          freelancer={freelancer}
          services={services}
          servicesMeta={servicesMeta}
          servicesPage={servicesPage}
          reviews={reviews}
          reviewsMeta={reviewsMeta}
          reviewsPage={reviewsPage}
          isOwner={fid === freelancerId}
        />
      </>
    );
  }
}
