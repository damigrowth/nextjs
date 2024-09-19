import React from "react";
import FreelancerCard from "../../Cards/FreelancerCard";
import FreelancerArchiveSchema from "@/utils/Seo/Schema/FreelancerArchiveSchema";

export default async function FreelancerGrid({
  freelancers,
  taxonomies,
  type,
}) {
  return (
    <div className="row">
      <FreelancerArchiveSchema
        type={type}
        entities={freelancers}
        taxonomies={taxonomies}
      />
      {freelancers.length > 0 ? (
        freelancers.map(
          (freelancer, i) =>
            freelancer?.attributes?.user?.data?.attributes && (
              <div key={i} className="col-sm-6 col-xl-4">
                <FreelancerCard
                  freelancer={freelancer?.attributes}
                  linkedName
                />
              </div>
            )
        )
      ) : (
        <div>Δεν βρέθηκαν επαγγελματίες</div>
      )}
    </div>
  );
}
