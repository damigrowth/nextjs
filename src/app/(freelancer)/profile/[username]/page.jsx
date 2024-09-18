import FreelancerProfile from "@/components/ui/profiles/freelancer/FreelancerProfile";
import {
  getFeaturedServicesByFreelancer,
  getFreelancerByUsername,
  getReviewsByFreelancer,
} from "@/lib/freelancer/freelancer";
import { redirect } from "next/navigation";
import ProfileBreadcrumb from "@/components/ui/breadcrumbs/freelancer/ProfileBreadcrumb";
import { getData } from "@/lib/client/operations";
import Tabs from "@/components/ui/Archives/Tabs";
import { Meta } from "@/utils/Seo/Meta/Meta";
import { FREELANCER_CATEGORIES } from "@/lib/graphql/queries/main/taxonomies/freelancer";

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { username } = params;

  const data = {
    type: "freelancer",
    params: { username },
    titleTemplate: "%displayName% - %type% - %category%. %tagline%",
    descriptionTemplate: "%description%",
    size: 160,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { username } = params;

  const { freelancer, uid } = await getFreelancerByUsername(username);

  if (!freelancer) {
    redirect("/not-found");
  } else {
    let servicesPage = parseInt(searchParams.services, 10);
    servicesPage = !servicesPage || servicesPage < 1 ? 1 : servicesPage;
    const servicesPageSize = servicesPage * 3;

    let reviewsPage = parseInt(searchParams.reviews, 10);
    reviewsPage = !reviewsPage || reviewsPage < 1 ? 1 : reviewsPage;
    const reviewsPageSize = reviewsPage * 3;

    const { reviews, reviewsMeta } = await getReviewsByFreelancer(
      uid,
      1,
      reviewsPageSize
    );

    const { services, servicesMeta } = await getFeaturedServicesByFreelancer(
      uid,
      servicesPageSize
    );

    const type = freelancer?.type?.data?.attributes?.slug;

    const { categories } = await getData(FREELANCER_CATEGORIES);

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
          subjectTitle={freelancer?.displayName}
        />
        <FreelancerProfile
          uid={uid}
          freelancer={freelancer}
          services={services}
          servicesMeta={servicesMeta}
          servicesPage={servicesPage}
          reviews={reviews}
          reviewsMeta={reviewsMeta}
          reviewsPage={reviewsPage}
        />
      </>
    );
  }
}
