import React from "react";
import ServiceCard from "./ServiceCard";
import { getBestDimensions } from "@/utils/imageDimensions";
import LoadMoreBtn from "./LoadMoreBtn";

export default async function FeaturedServices({
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
        {services.map((service, i) => (
          <div className="col-sm-6 col-xl-4" key={i}>
            <ServiceCard
              media={service.attributes.media.data}
              price={service.attributes.price}
              category={service.attributes.category.data.attributes.label}
              title={service.attributes.title}
              rating={service.attributes.rating}
              reviews_total={service.attributes.reviews_total}
              slug={service.attributes.slug}
            />
          </div>
        ))}
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
