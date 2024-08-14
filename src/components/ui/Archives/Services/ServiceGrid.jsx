import React from "react";
import ServiceCard from "../../Cards/ServiceCard";
import ServiceArchiveSchema from "@/utils/Seo/Schema/ServiceArchiveSchema";

export default function ServiceGrid({ services, categories }) {
  return (
    <div className="row">
      <div className="col-lg-12">
        <ServiceArchiveSchema entities={services} categories={categories} />
        {services.length > 0 ? (
          services.map((service, i) => (
            <div key={i}>
              <ServiceCard service={service} />
            </div>
          ))
        ) : (
          <div>Δεν βρέθηκαν υπηρεσίες</div>
        )}
      </div>
    </div>
  );
}
