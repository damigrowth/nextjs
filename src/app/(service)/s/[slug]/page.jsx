import { redirect } from 'next/navigation';

// import FeaturedServices from "@/components/ui/SingleService/Featured";
import { BreadcrumbArchives } from '@/components/breadcrumb';
import { Tabs } from '@/components/section';
import { getData } from '@/lib/client/operations';
import { CATEGORIES } from '@/lib/graphql';
import { Meta } from '@/utils/Seo/Meta/Meta';
import SingleService from '@/components/content/content-service';
import { getReviewsByService, getServicesById } from '@/actions/shared/service';
import { getFreelancer } from '@/actions/shared/freelancer';
import { getSavedStatus } from '@/actions/shared/save';

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

export const dynamicParams = true;

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const parts = slug.split('-');

  const serviceId = parts[parts.length - 1];

  const data = {
    type: 'services',
    params: { id: serviceId },
    titleTemplate: '%title% από %displayName%',
    descriptionTemplate: '%category% - %description%',
    size: 100,
    customUrl: `/s`,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { slug } = await params;

  const { reviews: searchParamsReviews } = await searchParams;

  const parts = slug.split('-');

  const paramsServiceId = parts[parts.length - 1];

  const service = await getServicesById(paramsServiceId);

  if (!service || service?.status?.data?.attributes?.type !== 'Active') {
    redirect('/not-found');
  } else {
    const serviceId = service.id;

    let reviewsPage = parseInt(searchParamsReviews, 10);

    reviewsPage = !reviewsPage || reviewsPage < 1 ? 1 : reviewsPage;

    const reviewsPageSize = reviewsPage * 3;

    const { reviews, reviewsMeta } = await getReviewsByService(
      serviceId,
      1,
      reviewsPageSize,
    );

    const { categories } = await getData(CATEGORIES);

    const freelancer = await getFreelancer();

    const fid = freelancer?.id;

    const email = freelancer?.email;

    const displayName = freelancer?.displayName;

    const username = freelancer?.username;

    let savedStatus;

    if (fid) {
      savedStatus = await getSavedStatus('service', serviceId);
    }

    return (
      <>
        <Tabs type='categories' categories={categories?.data} />
        <div className='bgc-thm3'>
          <BreadcrumbArchives
            parentPathLabel='Υπηρεσίες'
            parentPathLink='ipiresies'
            category={service?.category?.data?.attributes}
            subcategory={service?.subcategory?.data?.attributes}
            subdivision={service?.subdivision?.data?.attributes}
            categoriesRoute={true}
            subjectTitle={service?.title}
            id={service?.id}
            savedStatus={savedStatus}
            isAuthenticated={fid ? true : false}
          />
          <SingleService
            slug={slug}
            fid={fid}
            freelancerDisplayName={displayName}
            freelancerUsername={username}
            freelancerEmail={email}
            serviceId={serviceId}
            service={service}
            reviews={reviews}
            reviewsPage={reviewsPage}
            reviewsMeta={reviewsMeta}
          />
          {/* <FeaturedServices
            category={service?.category?.data?.attributes?.slug}
            subcategory={service?.subcategory?.data?.attributes?.slug}
          /> */}
        </div>
      </>
    );
  }
}
