import PopulerService from "@/components/section/PopulerService";
import React from "react";
import TabSection1 from "@/components/section/TabSection1";
import { redirect } from "next/navigation";
import SingleService from "@/components/ui/SingleService/SingleService";
import { getReviewsByService, getServiceBySlug } from "@/lib/service/service";
import ServiceBreadcrumb from "@/components/ui/breadcrumbs/service/ServiceBreadcrumb";
import { getData } from "@/lib/client/operations";
import Tabs from "@/components/ui/Archives/Tabs";
import { dynamicMeta } from "@/utils/Seo/Meta/dynamicMeta";
import { CATEGORIES } from "@/lib/graphql/queries/main/taxonomies/service";

// Dynamic SEO
export async function generateMetadata({ params }) {
  const serviceSlug = params.slug;
  const titleTemplate = "%title% από %displayName%";
  const descriptionTemplate = "%category% - %description%";
  const descriptionSize = 100;

  const { meta } = await dynamicMeta(
    "service",
    { slug: serviceSlug },
    titleTemplate,
    descriptionTemplate,
    descriptionSize
  );

  return meta;
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

    const { categories } = await getData(CATEGORIES);

    return (
      <>
        <Tabs
          parentPathLabel="Όλες οι κατηγορίες"
          parentPathLink="ipiresies"
          categories={categories?.data}
          serviceCategory={service?.category?.data?.attributes?.slug}
        />
        <div className="bgc-thm3">
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
