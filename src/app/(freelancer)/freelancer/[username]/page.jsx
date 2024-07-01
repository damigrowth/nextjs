import Breadcumb10 from "@/components/breadcumb/Breadcumb10";
import FreelancerProfile from "@/components/ui/profiles/freelancer/FreelancerProfile";
import TabSection1 from "@/components/section/TabSection1";
import {
  getAllReviewsRatingsByFreelancer,
  getFeaturedServicesByFreelancer,
  getFreelancerByUsername,
  getReviewsByFreelancer,
} from "@/lib/freelancer/freelancer";
import { getRatings } from "@/lib/rating/get";
import { inspect } from "@/utils/inspect";
import { redirect } from "next/navigation";
import ProfileBreadcrumb from "@/components/ui/breadcrumbs/freelancer/ProfileBreadcrumb";

export const metadata = {
  title:
    "Freeio - Freelance Marketplace React/Next Js Template | Freelancer Single",
};

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

    const ratings = await getRatings();

    const { reviews, reviewsMeta } = await getReviewsByFreelancer(
      uid,
      1,
      reviewsPageSize
    );

    const { allReviewsRatings } = await getAllReviewsRatingsByFreelancer(
      uid,
      1000
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
          ratings={ratings}
          reviews={reviews}
          reviewsMeta={reviewsMeta}
          reviewsPage={reviewsPage}
          allReviewsRatings={allReviewsRatings}
        />
      </>
    );
  }
  // inspect(freelancer);
}
