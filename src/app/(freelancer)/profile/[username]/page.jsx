import FreelancerProfile from "@/components/ui/profiles/freelancer/FreelancerProfile";
import {
  getFeaturedServicesByFreelancer,
  getFreelancerByUsername,
  getFreelancerId,
  getReviewsByFreelancer,
} from "@/lib/users/freelancer";
import { redirect } from "next/navigation";
import ProfileBreadcrumb from "@/components/ui/breadcrumbs/freelancer/ProfileBreadcrumb";
import { getData } from "@/lib/client/operations";
import Tabs from "@/components/ui/Archives/Tabs";
import { Meta } from "@/utils/Seo/Meta/Meta";
import { FREELANCER_CATEGORIES } from "@/lib/graphql/queries/main/taxonomies/freelancer";
import { getSavedStatus } from "@/lib/save";

export const dynamic = "force-dynamic";
export const revalidate = 3600;
export const dynamicParams = true;

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { username } = await params;

  const data = {
    type: "freelancer",
    params: { username },
    titleTemplate: "%displayName% - %type% - %category%. %tagline%",
    descriptionTemplate: "%description%",
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

  const fid = await getFreelancerId();

  const { freelancer } = await getFreelancerByUsername(username);

  if (!freelancer) {
    redirect("/not-found");
  } else {
    const freelancerId = freelancer.id;

    let servicesPage = parseInt(searchParmasServices, 10);
    servicesPage = !servicesPage || servicesPage < 1 ? 1 : servicesPage;
    const servicesPageSize = servicesPage * 3;

    let reviewsPage = parseInt(searchParmasReviews, 10);
    reviewsPage = !reviewsPage || reviewsPage < 1 ? 1 : reviewsPage;
    const reviewsPageSize = reviewsPage * 3;

    const { reviews, reviewsMeta } = await getReviewsByFreelancer(
      freelancerId,
      1,
      reviewsPageSize
    );

    const { services, servicesMeta } = await getFeaturedServicesByFreelancer(
      freelancerId,
      servicesPageSize
    );

    const type = freelancer?.type?.data?.attributes?.slug;

    const { categories } = await getData(FREELANCER_CATEGORIES);

    const emailSubjectTitle = `${freelancer?.displayName} ${
      freelancer?.type?.data?.attributes?.label
    } ${
      freelancer?.subcategory?.data
        ? freelancer?.subcategory?.data?.attributes?.label
        : ""
    }`;

    let savedStatus = null;

    if (fid !== freelancerId) {
      savedStatus = await getSavedStatus("freelancer", freelancerId);
    }

    return (
      <>
        <Tabs
          parentPathLabel="Όλες οι κατηγορίες"
          parentPathLink="pros"
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
        />
        <FreelancerProfile
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
