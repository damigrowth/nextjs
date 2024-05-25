import React from "react";

export default function Info({ time, area }) {
  return (
    <div className="row">
      <div className="col-sm-6 col-md-4">
        <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
          <div className="icon flex-shrink-0">
            <span className="flaticon-calendar" />
          </div>
          <div className="details">
            <h5 className="title">Χρόνος Παράδοσης</h5>
            <p className="mb-0 text">{time} Μέρες</p>
          </div>
        </div>
      </div>
      {/* <div className="col-sm-6 col-md-4">
      <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
        <div className="icon flex-shrink-0">
          <span className="flaticon-goal" />
        </div>
        <div className="details">
          <h5 className="title">English Level</h5>
          <p className="mb-0 text">Professional</p>
        </div>
      </div>
    </div> */}
      <div className="col-sm-6 col-md-4">
        <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
          <div className="icon flex-shrink-0">
            <span className="flaticon-tracking" />
          </div>
          <div className="details">
            <h5 className="title">Περιοχή</h5>
            <p className="mb-0 text">{area}</p>
          </div>
        </div>
      </div>
    </div>
  );
}