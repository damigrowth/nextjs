import React from "react";

export default function Metrics({
  subcategory,
  servicesTotal,
  commencement,
  yearsOfExperience,
}) {
  return (
    <div className="row px20">
      {subcategory && (
        <div className="col-sm-12 col-xl-6">
          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
            <div className="icon flex-shrink-0">
              <span className="flaticon-category" />
            </div>
            <div className="details">
              <h5 className="title fw600">{subcategory}</h5>
            </div>
          </div>
        </div>
      )}
      {servicesTotal && (
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
      )}

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
    </div>
  );
}
