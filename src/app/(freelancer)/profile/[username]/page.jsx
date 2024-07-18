import FreelancerProfile from "@/components/ui/profiles/freelancer/FreelancerProfile";
import TabSection1 from "@/components/section/TabSection1";
import {
  getFeaturedServicesByFreelancer,
  getFreelancerByUsername,
  getReviewsByFreelancer,
} from "@/lib/freelancer/freelancer";
import { redirect } from "next/navigation";
import ProfileBreadcrumb from "@/components/ui/breadcrumbs/freelancer/ProfileBreadcrumb";
import { generateMeta } from "@/utils/seo";

// Dynamic SEO
export async function generateMetadata({ params }) {
  const username = params.username;
  return await generateMeta("freelancer", { username });
}

export default async function page({ params, searchParams }) {
  const username = params.username;

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

    return (
      <>
        <TabSection1 />
        <ProfileBreadcrumb category={freelancer?.category} />
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
