import React from "react";

export default function Meta({
  title,
  displayName,
  rating,
  ratingServicesCount,
}) {
  return (
    <div className="col-xl-12 mb30 pb30 bdrb1">
      <div className="position-relative">
        <h2>{title}</h2>
        <div className="list-meta mt30">
          <a className="list-inline-item mb5-sm" href="#">
            <span className="position-relative mr10">
              {/* {!service.freelancer.data.attributes.avatar ? (
              <Image
                width={40}
                height={40}
                className="rounded-circle"
                src="/images/team/fl-d-1.png"
                alt="Freelancer Photo"
              />
            ) : (
              <Avatar
                firstName={
                  service.freelancer.data.attributes.firstName
                }
                lastName={
                  service.freelancer.data.attributes.lastName
                }
                avatar=""
              />
            )} */}

              <span className="online-badge"></span>
            </span>
            <span className="fz14">{displayName}</span>
          </a>
          <p className="mb-0 dark-color fz14 list-inline-item ml25 ml15-sm mb5-sm ml0-xs">
            <i className="fas fa-star vam fz10 review-color mb5"></i>{" "}
            <span>{rating}</span>
            <span className="ml5">
              {ratingServicesCount > 0
                ? `(${ratingServicesCount}) κριτική`
                : `(${ratingServicesCount}) κριτικές`}
            </span>
          </p>
          <p className="mb-0 dark-color fz14 list-inline-item ml25 ml15-sm mb5-sm ml0-xs">
            <i className="flaticon-file-1 vam fz20 me-2"></i> 2 Order in Queue
          </p>
          <p className="mb-0 dark-color fz14 list-inline-item ml25 ml15-sm mb5-sm ml0-xs">
            <i className="flaticon-website vam fz20 me-2"></i> 902 Views
          </p>
        </div>
      </div>
    </div>
  );
}
