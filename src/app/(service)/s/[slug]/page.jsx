import React from "react";
import { redirect } from "next/navigation";
import SingleService from "@/components/ui/SingleService/SingleService";
import {
  getReviewsByService,
  getServiceById,
  getServiceBySlug,
  getServicesById,
} from "@/lib/service/service";
import ServiceBreadcrumb from "@/components/ui/breadcrumbs/service/ServiceBreadcrumb";
import { getData } from "@/lib/client/operations";
import Tabs from "@/components/ui/Archives/Tabs";
import { Meta } from "@/utils/Seo/Meta/Meta";
import { CATEGORIES } from "@/lib/graphql/queries/main/taxonomies/service";
import FeaturedServices from "@/components/ui/SingleService/Featured";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import { getSavedStatus } from "@/lib/save";
import { getFreelancerId } from "@/lib/users/freelancer";

export const dynamic = "force-dynamic";
export const revalidate = 3600;
export const dynamicParams = true;

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const parts = slug.split("-");
  const serviceId = parts[parts.length - 1];
  const data = {
    type: "services",
    params: { id: serviceId },
    titleTemplate: "%title% από %displayName%",
    descriptionTemplate: "%category% - %description%",
    size: 100,
    customUrl: `/s`,
  };
  const { meta } = await Meta(data);
  return meta;
}

export default async function page({ params, searchParams }) {
  const { slug } = await params;
  const { reviews: searchParamsReviews } = await searchParams;

  const parts = slug.split("-");
  const paramsServiceId = parts[parts.length - 1];

  const service = await getServicesById(paramsServiceId);

  if (!service || service?.status?.data?.attributes?.type !== "Active") {
    redirect("/not-found");
  } else {
    const serviceId = service.id;

    let reviewsPage = parseInt(searchParamsReviews, 10);
    reviewsPage = !reviewsPage || reviewsPage < 1 ? 1 : reviewsPage;
    const reviewsPageSize = reviewsPage * 3;

    const { reviews, reviewsMeta } = await getReviewsByService(
      serviceId,
      1,
      reviewsPageSize
    );

    const { categories } = await getData(CATEGORIES);

    const fid = await getFreelancerId();

    let savedStatus;

    if (fid) {
      savedStatus = await getSavedStatus("service", serviceId);
    }

    return (
      <>
        <Tabs type="categories" categories={categories?.data} />
        <div className="bgc-thm3">
          <Breadcrumb
            parentPathLabel="Υπηρεσίες"
            parentPathLink="ipiresies"
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
