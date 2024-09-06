import React from "react";
import FeaturedServiceSliderCard from "../Cards/FeaturedServiceSliderCard";
import FeaturedServiceCard from "../Cards/FeaturedServiceCard";
import { SERVICES_BY_CATEGORY } from "@/lib/graphql/queries/main/service";
import { getData } from "@/lib/client/operations";

export default async function FeaturedServices({ category, subcategory }) {
  const { services } = await getData(SERVICES_BY_CATEGORY, {
    category,
    subcategory,
  });

  return (
    <section className="pb40-md pb70 mt70 mt0-lg">
      <div className="container">
        <div className="row align-items-center wow fadeInUp">
          <div className="col-lg-12">
            <div className="main-title mb30-lg">
              <h2 className="title">Σχετικές Υπηρεσίες</h2>
              <p className="paragraph">
                Δείτε τις υπηρεσίες με τη μεγαλύτερη ζήτηση
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          {services.data.map((service, i) => (
            <div key={i} className="col-sm-6 col-xl-3">
              {service.attributes.media?.data?.length > 1 ? (
                <FeaturedServiceSliderCard service={service.attributes} />
              ) : (
                <FeaturedServiceCard service={service.attributes} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
