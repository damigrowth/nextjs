import React from "react";

export default function Breadcrumb({ data }) {
  return (
    <section className="breadcumb-section bg-white mt40">
      <div className="cta-about-v1 mx-auto maxw1700 pt120 pb120 bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg">
        <div className="container">
          <div className="row">
            <div className="col-xl-5">
              <div className="position-relative">
                <h2 className="text-white">{data.title}</h2>
                <p className="text-white mb30">{data.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
