import React from "react";

export default function Info({ time, category, subcategory, area }) {
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
      {time && (
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
      {area && (
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
      )}
    </div>
  );
}
