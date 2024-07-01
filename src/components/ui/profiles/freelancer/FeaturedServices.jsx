import FreelancerFutureCard1 from "@/components/card/FreelancerFutureCard1";
import { getData } from "@/lib/client/operations";
import { FEATURED_SERVICES_BY_FREELANCER } from "@/lib/graphql/queries";
import React from "react";
import ServiceCard from "./ServiceCard";
import { getBestDimensions } from "@/utils/imageDimensions";
import LoadMoreBtn from "./LoadMoreBtn";

export default async function FeaturedServices({
  uid,
  services,
  meta,
  servicesPage,
}) {
  if (services.length === 0) {
    return null;
  }
  return (
    <>
      <hr className="opacity-100 mb60 mt60" />
      <h4 className="mb30">
        {meta.total > 1 ? `${meta.total} Υπηρεσίες` : `${meta.total} Υπηρεσία`}{" "}
      </h4>

      <div className="row mb35">
        {services.map((service, i) => {
          const image = getBestDimensions(
            service.attributes?.media?.data[0]?.attributes?.formats
          );
          const imageUrl = image.url;
          return (
            <div className="col-sm-6 col-xl-4" key={i}>
              <ServiceCard
                image={imageUrl}
                price={service.attributes.price}
                category={service.attributes.category.data.attributes.label}
                title={service.attributes.title}
                rating={service.attributes.rating}
                reviews={null}
                slug={service.attributes.slug}
              />
            </div>
          );
        })}
      </div>

      <LoadMoreBtn
        name="Υπηρεσίες"
        paramsName="services"
        total={meta.total}
        count={services.length}
        paramsPage={servicesPage}
      />
      <hr className="opacity-100 mb60 mt60" />
    </>
  );
}
