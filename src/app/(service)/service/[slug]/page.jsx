import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import PopulerService from "@/components/section/PopulerService";
import React from "react";
import TabSection1 from "@/components/section/TabSection1";
import { redirect } from "next/navigation";
import { fetchModel } from "@/lib/models/model";
import { VIEWS_BY_SERVICE_USER } from "@/lib/queries";
import SingleService from "@/components/ui/SingleService";
import { postData, putData } from "@/lib/api";
import { getUserId } from "@/lib/user/user";
import { truncateText } from "@/utils/truncateText";
import { getData } from "@/lib/client/operations";
import { RATINGS, SERVICE_BY_SLUG } from "@/lib/graphql/queries";
import {
  getAllReviewsRatingsByService,
  getReviewsByService,
  getServiceBySlug,
} from "@/lib/service/service";
import { getRatings } from "@/lib/rating/get";
import { getReviewsByFreelancer } from "@/lib/freelancer/freelancer";
import ServiceBreadcrumb from "@/components/ui/breadcrumbs/service/ServiceBreadcrumb";

// Dynamic SEO
export async function generateMetadata({ params }) {
  const serviceSlug = params.slug;
  const { services } = await getData(SERVICE_BY_SLUG, { slug: serviceSlug });
  const service = services.data[0].attributes;

  // console.log("META", service[0].attributes.seo);

  if (service === undefined) {
    redirect("/not-found");
  } else {
    const title = service.title;
    const description = truncateText(service.description, 155);

    let metaTitle = "";
    let metaDescription = "";

    if (service.seo !== null) {
      metaTitle = service.seo.metaTitle + " - " + "Doulitsa";
      metaDescription = service.seo.metaDescription;
    } else {
      metaTitle = title + " - " + "Doulitsa";
      metaDescription = description;
    }

    return {
      title: metaTitle,
      description: metaDescription,
    };
  }
}

export default async function page({ params, searchParams }) {
  const serviceSlug = params.slug;

  const { service, uid } = await getServiceBySlug(serviceSlug);

  if (!service) {
    redirect("/not-found");
  } else {
    let reviewsPage = parseInt(searchParams.reviews, 10);
    reviewsPage = !reviewsPage || reviewsPage < 1 ? 1 : reviewsPage;
    const reviewsPageSize = reviewsPage * 3;

    const freelancerId = Number(service.freelancer.data.id);

    // const userId = await getUserId();
    const ratings = await getRatings();

    const { reviews, reviewsMeta } = await getReviewsByService(
      uid,
      1,
      reviewsPageSize
    );

    const { allReviewsRatings } = await getAllReviewsRatingsByService(
      uid,
      1000
    );

    const { reviewsMeta: freelancerReviewsMeta } = await getReviewsByFreelancer(
      freelancerId,
      1,
      1
    );

    const totalFreelancerReviews = freelancerReviewsMeta.total;

    // if (serviceId && userId) {
    //   // Get current views of service based on service id and user id
    //   const { views } = await fetchModel(

    //     "views",
    //     VIEWS_BY_SERVICE_USER(serviceId, userId)
    //   );

    //   if (views) {
    //     // Check if the length of the filtered array is not empty
    //     if (views.length === 0) {
    //       const newView = {
    //         user: userId,
    //         service: serviceId,
    //       };

    //       await postData("views", newView);
    //     }
    //   }
    // }

    return (
      <>
        <TabSection1 />
        <div className=" bgc-thm3">
          {/* <Breadcumb3 path={["Home", "Services", "Design & Creative"]} /> */}
          <ServiceBreadcrumb category={service?.category} />
          <SingleService
            serviceId={uid}
            service={service}
            reviews={reviews}
            ratings={ratings}
            reviewsPage={reviewsPage}
            reviewsMeta={reviewsMeta}
            allReviewsRatings={allReviewsRatings}
            totalFreelancerReviews={totalFreelancerReviews}
          />
          <PopulerService />
        </div>
      </>
    );
  }
}
