import React from "react";

export default function Info({ time, category, subcategory, coverage, type }) {
  const {
    online,
    presence,
    oneoff,
    subscription,
    onbase,
    onsite,
    subscription_type,
  } = type;

  const address = coverage?.address;
  const areas = coverage?.areas;
  const county = coverage?.county;

  return (
    <div className="row">
      {category && (
        <div className="col-sm-6 col-md-4">
          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
            <div className="icon flex-shrink-0">
              <span
                className={
                  !category?.icon ? "flaticon-category" : category?.icon
                }
              />
            </div>
            <div className="details">
              <h5 className="title">{category?.label}</h5>
              <h2 className="heading-p">{subcategory?.label}</h2>
            </div>
          </div>
        </div>
      )}
      {online && (
        <div className="col-sm-6 col-md-4">
          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
            <div className="icon flex-shrink-0">
              <span className="flaticon-customer-service" />
            </div>
            <div className="details">
              <h5 className="title">Εξυπηρετεί</h5>
              <div className="d-flex align-items-center">
                <span className="user-online mr5"></span>
                <p className="mb-0 text">Online</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {online && subscription && subscription_type && (
        <div className="col-sm-6 col-md-4">
          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
            <div className="icon flex-shrink-0">
              <span className="flaticon-recycle" />
            </div>
            <div className="details">
              <h5 className="title">Συνδρομή</h5>
              <p className="mb-0 text">
                {subscription_type === "month" ? "Μηνιαία" : "Ετήσια"}
              </p>
            </div>
          </div>
        </div>
      )}
      {online && oneoff && time && (
        <div className="col-sm-6 col-md-4">
          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
            <div className="icon flex-shrink-0">
              <span className="flaticon-fifteen" />
            </div>
            <div className="details">
              <h5 className="title">Χρόνος Παράδοσης</h5>
              <p className="mb-0 text">
                {time > 1 ? time + " " + "Μέρες" : time + " " + "Μέρα"}
              </p>
            </div>
          </div>
        </div>
      )}
      {presence && onbase && address && county?.data && (
        <div className="col-sm-6 col-md-4">
          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
            <div className="icon flex-shrink-0">
              <span className="flaticon-tracking" />
            </div>
            <div className="details">
              <h5 className="title">Περιοχή</h5>
              <p className="mb-0 text">
                {address}, {county?.data?.attributes?.name}
              </p>
            </div>
          </div>
        </div>
      )}
      {presence && onsite && areas?.data?.length > 0 && (
        <div className="col-sm-6 col-md-4">
          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
            <div className="icon flex-shrink-0">
              <span className="flaticon-tracking" />
            </div>
            <div className="details">
              <h5 className="title">Περιοχή</h5>
              <p className="mb-0 text">
                {areas.data.map((area) => area?.attributes?.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
