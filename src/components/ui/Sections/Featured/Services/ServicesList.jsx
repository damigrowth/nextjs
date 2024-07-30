"use client";

import FeaturedServiceCard from "@/components/ui/Cards/FeaturedServiceCard";
import FeaturedServiceSliderCard from "@/components/ui/Cards/FeaturedServiceSliderCard";
import useHomeStore from "@/store/home/homeStore";
import React from "react";

export default function ServicesList({ services }) {
  const { featuredCategory } = useHomeStore();

  return (
    <div className="row">
      {services

        .filter((item) =>
          featuredCategory === ""
            ? item
            : item.attributes.category?.data?.attributes?.slug ===
                featuredCategory && item
        )
        .slice(0, 4)
        .map((service, i) => (
          <div key={i} className="col-sm-6 col-xl-3">
            {service.attributes.media?.data?.length > 1 ? (
              <FeaturedServiceSliderCard service={service.attributes} />
            ) : (
              <FeaturedServiceCard service={service.attributes} />
            )}
          </div>
        ))}
    </div>
  );
}
