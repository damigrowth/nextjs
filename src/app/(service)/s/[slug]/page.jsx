import PopulerService from "@/components/section/PopulerService";
import React from "react";
import TabSection1 from "@/components/section/TabSection1";
import { redirect } from "next/navigation";
import SingleService from "@/components/ui/SingleService/SingleService";
import { getReviewsByService, getServiceBySlug } from "@/lib/service/service";
import ServiceBreadcrumb from "@/components/ui/breadcrumbs/service/ServiceBreadcrumb";
import { generateMeta } from "@/utils/seo";

// Dynamic SEO
export async function generateMetadata({ params }) {
  const serviceSlug = params.slug;
  return await generateMeta("service", { slug: serviceSlug });
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

    const { reviews, reviewsMeta } = await getReviewsByService(
      uid,
      1,
      reviewsPageSize
    );

    return (
      <>
        <TabSection1 />
        <div className=" bgc-thm3">
          <ServiceBreadcrumb category={service?.category} />
          <SingleService
            serviceId={uid}
            service={service}
            reviews={reviews}
            reviewsPage={reviewsPage}
            reviewsMeta={reviewsMeta}
          />
          <PopulerService />
        </div>
      </>
    );
  }
}
