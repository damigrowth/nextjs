import React, { useMemo } from "react";
import AllTaxonomiesTabs from "./AllTaxonomiesTabs";
import AllTaxonomiesList from "./AllTaxonomiesList";

export default function AllTaxonomies({
  freelancerSubcategories = [],
  serviceSubcategories = [],
}) {
  const groupItems = (items) => {
    const groupsArray = [];
    for (let i = 0; i < items.length; i += 6) {
      groupsArray.push(items.slice(i, i + 6));
    }
    return groupsArray;
  };

  const freelancerGroups = useMemo(
    () => groupItems(freelancerSubcategories),
    [freelancerSubcategories]
  );

  const serviceGroups = useMemo(
    () => groupItems(serviceSubcategories),
    [serviceSubcategories]
  );

  const taxonomies = [
    {
      label: "Κατηγορίες Επαγγελμάτων",
      data: freelancerGroups,
    },
    {
      label: "Κατηγορίες Υπηρεσιών",
      data: serviceGroups,
    },
  ];

  return (
    <section className="pb90 pb30-md pt110 bgorange">
      <div className="container">
        <div className="row align-items-md-center">
          <div className="col-lg-12">
            <div className="home9-navtab-style">
              <div className="navtab-style2">
                <AllTaxonomiesTabs taxonomies={taxonomies} />
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5">
                  {taxonomies.map((tax, i) => (
                    <AllTaxonomiesList key={i} list={tax.data} tabIndex={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
