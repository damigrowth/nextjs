import React from "react";
import ServiceCard from "../../Cards/ServiceCard";

export default function ServiceGrid({ services }) {
  return (
    <div className="row">
      <div className="col-lg-12">
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
