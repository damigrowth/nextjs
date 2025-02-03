import React from "react";
import { redirect } from "next/navigation";
import SingleService from "@/components/ui/SingleService/SingleService";
import {
  getReviewsByService,
  getServiceById,
  getServiceBySlug,
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
  const { slug } = params;

  const parts = slug.split("-");
  const serviceId = parts[parts.length - 1];

  const data = {
    type: "service",
    params: { id: serviceId },
    titleTemplate: "%title% από %displayName%",
    descriptionTemplate: "%category% - %description%",
    size: 100,
    url: `/s/${slug}`,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { slug } = params;

  const parts = slug.split("-");
  const serviceId = parts[parts.length - 1];

  const service = await getServiceById(serviceId);

  if (!service) {
    redirect("/not-found");
  } else {
    let reviewsPage = parseInt(searchParams.reviews, 10);
    reviewsPage = !reviewsPage || reviewsPage < 1 ? 1 : reviewsPage;
    const reviewsPageSize = reviewsPage * 3;

    const { reviews, reviewsMeta } = await getReviewsByService(
      service.id,
      1,
      reviewsPageSize
    );

    const { categories } = await getData(CATEGORIES);

    const fid = await getFreelancerId();

    let savedStatus;

    if (fid) {
      savedStatus = await getSavedStatus("service", service.id);
    }

    return (
      <>
        <Tabs
          parentPathLabel="Όλες οι κατηγορίες"
          parentPathLink="categories"
          categories={categories?.data}
        />
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
          />
          <SingleService
            slug={slug}
            serviceId={service.id}
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
