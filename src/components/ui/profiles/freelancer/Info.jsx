import Link from "next/link";
import React from "react";

export default function Info({
  rate,
  base,
  coverage,
  commencement,
  website,
  phone,
  email,
}) {
  // console.log(coverage);
  const formattedWebsite = website ? website.replace(/^https?:\/\//, "") : null;
  const covers = coverage ? (coverage.online ? "Online" : "") : null;
  return (
    <>
      <div className="price-widget pt25 bdrs8">
        {rate && (
          <h3 className="widget-title">
            {}
            {rate}€<small className="fz15 fw500"> / εργατοώρα</small>
          </h3>
        )}

        <div className="category-list mt20">
          {base && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-2">
              <span className="text">
                <i className="flaticon-place text-thm2 pe-2 vam" />
                Περιοχή
              </span>
              <span>{base}</span>
            </div>
          )}
          {covers && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-2">
              <span className="text">
                <i className="flaticon-customer-service text-thm2 pe-2 vam" />
                Εξυπηρετεί
              </span>
              <span>{covers}</span>
            </div>
          )}
          {commencement && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-2">
              <span className="text">
                <i className="flaticon-calendar text-thm2 pe-2 vam" />
                Έτος Έναρξης
              </span>
              <span>{commencement}</span>
            </div>
          )}
          {formattedWebsite && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-2">
              <span className="text">
                <i className="flaticon-website text-thm2 pe-2 vam" />
                Ιστοσελίδα
              </span>
              <a href={website} target="_blank" rel="noopener noreferrer">
                {formattedWebsite}
              </a>
            </div>
          )}
          {phone && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-2">
              <span className="text">
                <i className="flaticon-call text-thm2 pe-2 vam" />
                Τηλέφωνο
              </span>
              <a href={`tel:${phone}`}>{phone}</a>
            </div>
          )}
          {email && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-2">
              <span className="text">
                <i className="flaticon-mail text-thm2 pe-2 vam" />
                Email
              </span>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          )}
        </div>

        <div className="d-grid mt30">
          <Link href="/contact" className="ud-btn btn-thm">
            Επικοινωνία
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </>
  );
}
