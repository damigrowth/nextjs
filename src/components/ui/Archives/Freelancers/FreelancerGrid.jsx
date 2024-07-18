import React from "react";
import FreelancerCard from "./FreelancerCard";

export default async function FreelancerGrid({ freelancers }) {
  return (
    <div className="row">
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
