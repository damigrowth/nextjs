import React from "react";
import CategoryTabs from "./CategoryTabs";
import ServicesList from "./ServicesList";

export default function FeaturedServices({ categories, services, fid }) {
  return (
    <section className={`pt-0 pb100`}>
      <div className="container">
        <div className="row align-items-center wow fadeInUp">
          <div className="col-xl-3">
            <div className="main-title mb30-lg">
              <h2 className="title">Δημοφιλείς Υπηρεσίες</h2>
              <p className="paragraph">
                Δείτε τις υπηρεσίες με τη μεγαλύτερη ζήτηση
              </p>
            </div>
          </div>
          <div className="col-xl-9">
            <div className="navpill-style2 at-home9 mb50-lg">
              <CategoryTabs categories={categories} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <ServicesList services={services} fid={fid} />
          </div>
        </div>
      </div>
    </section>
  );
}
