import React from "react";

export default function Description({ description }) {
  return (
    <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
      <h4>Περιγραφή</h4>
      <div className="text mb30 rich-text-editor">
        <p>{description}</p>
        {/* <BlocksRenderer content={service.description} /> */}
      </div>
    </div>
  );
}
