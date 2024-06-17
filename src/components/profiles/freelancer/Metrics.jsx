import React from "react";

export default function Metrics() {
  return (
    <div className="row">
      <div className="col-sm-6 col-xl-3">
        <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
          <div className="icon flex-shrink-0">
            <span className="flaticon-target" />
          </div>
          <div className="details">
            <h5 className="title">Job Success</h5>
            <p className="mb-0 text">98%</p>
          </div>
        </div>
      </div>
      <div className="col-sm-6 col-xl-3">
        <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
          <div className="icon flex-shrink-0">
            <span className="flaticon-goal" />
          </div>
          <div className="details">
            <h5 className="title">Total Jobs</h5>
            <p className="mb-0 text">921</p>
          </div>
        </div>
      </div>
      <div className="col-sm-6 col-xl-3">
        <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
          <div className="icon flex-shrink-0">
            <span className="flaticon-fifteen" />
          </div>
          <div className="details">
            <h5 className="title">Total Hours</h5>
            <p className="mb-0 text">1,499</p>
          </div>
        </div>
      </div>
      <div className="col-sm-6 col-xl-3">
        <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
          <div className="icon flex-shrink-0">
            <span className="flaticon-file-1" />
          </div>
          <div className="details">
            <h5 className="title">In Queue Service</h5>
            <p className="mb-0 text">20</p>
          </div>
        </div>
      </div>
    </div>
  );
}
