import React from "react";
import FreelancerCard from "../../Cards/FreelancerCard";
import FreelancerArchiveSchema from "@/utils/Seo/Schema/FreelancerArchiveSchema";

export default async function FreelancerGrid({
  freelancers,
  categories,
  type,
}) {
  return (
    <div className="row">
      <FreelancerArchiveSchema
        type={type}
        entities={freelancers}
        categories={categories}
      />
      {freelancers.length > 0 ? (
        freelancers.map((freelancer, i) => (
          <div key={i} className="col-sm-6 col-xl-4">
            <FreelancerCard freelancer={freelancer?.attributes} />
          </div>
        ))
      ) : (
        <div>Δεν βρέθηκαν επαγγελματίες</div>
      )}
    </div>
  );
}
