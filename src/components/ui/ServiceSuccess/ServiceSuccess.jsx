import Link from "next/link";
import React from "react";

export default function ServiceSuccess({ id, title }) {
  return (
    <div className="ps-widget bdrs12 p30 mb30 overflow-hidden position-relative">
      <div className="success-container">
        <div className="success-icon bgc-thm">
          <i className="flaticon-success vam fz40 text-white " />
        </div>
        <h3 className="list-title text-center">
          Επιτυχής δημιουργία υπηρεσίας!
        </h3>
        <p className="text-center">
          Ευχαριστούμε για την δημιουργία υπηρεσίας <strong>{title}</strong> με
          κωδικό <strong>#{id}</strong>. <br />
          Σύντομα θα γίνει η δημοσίευση της αφού ολοκληρωθεί η διαδικασία
          ελέγχου της.
        </p>
        <div className="success-btns">
          <Link
            href="/dashboard/services"
            className="ud-btn btn-dark bdrs4 d-flex justify-content-end align-items-center gap-2 default-box-shadow p3"
          >
            Διαχείριση Υπηρεσιών
          </Link>
        </div>
      </div>
    </div>
  );
}
