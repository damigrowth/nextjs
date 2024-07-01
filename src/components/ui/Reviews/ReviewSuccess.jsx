import React from "react";

export default function ReviewSuccess({ id }) {
  return (
    <div className="ps-widget bgc-white bdrs12 p30 mb30 overflow-hidden position-relative">
      <div className="success-container">
        <div className="success-icon bgc-thm">
          <i className="flaticon-success vam fz40 text-white " />
        </div>
        <h3 className="list-title text-center">
          Επιτυχής αποστολή αξιολόγησης!
        </h3>
        <p className="text-center">
          Ευχαριστούμε για την αξιολόγηση σας με κωδικό <strong>#{id}</strong>.{" "}
          <br />
          Σύντομα θα γίνει η δημοσίευση της αφού ολοκληρωθεί η διαδικασία
          ελέγχου της.
        </p>
      </div>
    </div>
  );
}
