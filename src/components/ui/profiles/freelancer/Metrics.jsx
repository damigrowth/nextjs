import { getYearsOfExperience } from "@/utils/getYearsOfExperience";
import React from "react";

export default function Metrics({
  type,
  servicesTotal,
  commencement,
  verification,
  yearsOfExperience,
}) {
  // DONE IN THE BACKEND
  // const yearsOfExperience = getYearsOfExperience(commencement);

  const verified = verification === "Completed" ? true : false;

  return (
    <div className="row">
      {type && (
        <div className="col-sm-6 col-xl-3">
          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
            <div className="icon flex-shrink-0">
              <span className="flaticon-briefcase" />
            </div>
            <div className="details">
              <h5 className="title fw600">{type?.label}</h5>
              {/* <p className="mb-0 text">98%</p> */}
            </div>
          </div>
        </div>
      )}

      <div className="col-sm-6 col-xl-3">
        <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
          <div className="icon flex-shrink-0">
            <span className="flaticon-page" />
          </div>
          <div className="details">
            <h5 className="title fw600">Υπηρεσίες</h5>
            <p className="mb-0 text">{servicesTotal}</p>
          </div>
        </div>
      </div>
      {commencement && (
        <div className="col-sm-6 col-xl-3">
          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
            <div className="icon flex-shrink-0">
              <span className="flaticon-sand-clock" />
            </div>
            <div className="details">
              <h5 className="title fw600">Έτη Εμπειρίας</h5>
              <p className="mb-0 text">{yearsOfExperience}</p>
            </div>
          </div>
        </div>
      )}

      {verified && (
        <div className="col-sm-6 col-xl-3">
          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
            <div className="icon flex-shrink-0">
              <span className="flaticon-success" />
            </div>
            <div className="details">
              <h5 className="title fw600">Πιστοποιημένο Προφίλ</h5>
              {/* <p className="mb-0 text">{verified ? "Ναι" : "Όχι"}</p> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
