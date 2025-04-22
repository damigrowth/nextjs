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

  // Μετασχηματίζουμε τα δεδομένα αν έχουν τη μορφή response από το νέο query
  const transformFreelancerData = useMemo(() => {
    if (Array.isArray(freelancerSubcategories.data)) {
      // Είναι από το νέο query ALL_ACTIVE_TOP_TAXONOMIES
      return freelancerSubcategories.data.map(item => item.attributes);
    }
    // Είναι από το παλιό query ALL_TOP_TAXONOMIES
    return freelancerSubcategories;
  }, [freelancerSubcategories]);

  const transformServiceData = useMemo(() => {
    if (Array.isArray(serviceSubcategories.data)) {
      // Είναι από το νέο query ALL_ACTIVE_TOP_TAXONOMIES
      return serviceSubcategories.data.map(item => item.attributes);
    }
    // Είναι από το παλιό query ALL_TOP_TAXONOMIES
    return serviceSubcategories;
  }, [serviceSubcategories]);

  const freelancerGroups = useMemo(
    () => groupItems(transformFreelancerData),
    [transformFreelancerData]
  );

  const serviceGroups = useMemo(
    () => groupItems(transformServiceData),
    [transformServiceData]
  );

  // Αν δεν υπάρχουν δεδομένα για καμία από τις δύο κατηγορίες, μην εμφανίζουμε το section
  if (freelancerGroups.length === 0 && serviceGroups.length === 0) {
    return null;
  }

  const taxonomies = [];
  
  // Προσθέτουμε μόνο τις κατηγορίες που έχουν δεδομένα
  if (freelancerGroups.length > 0) {
    taxonomies.push({
      label: "Κατηγορίες Επαγγελμάτων",
      data: freelancerGroups,
    });
  }
  
  if (serviceGroups.length > 0) {
    taxonomies.push({
      label: "Κατηγορίες Υπηρεσιών",
      data: serviceGroups,
    });
  }

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
