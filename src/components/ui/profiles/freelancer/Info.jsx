"use client";

import React, { useState } from "react";

/**
 * Renders the information widget for a freelancer's profile.
 * Displays rate, location, service coverage, commencement year, website,
 * and contact details (phone, Viber, WhatsApp, email) with reveal functionality.
 *
 * @param {object} props - The component props.
 * @param {number} [props.rate] - The freelancer's hourly rate.
 * @param {object} [props.coverage] - Object detailing service coverage areas.
 * @param {boolean} [props.coverage.online] - Whether the freelancer offers online services.
 * @param {boolean} [props.coverage.onbase] - Whether the freelancer offers services at their location.
 * @param {boolean} [props.coverage.onsite] - Whether the freelancer offers services at the client's location.
 * @param {object} [props.coverage.county] - Strapi relation object for the county.
 * @param {object} [props.coverage.county.data] - Data object for the county.
 * @param {object} [props.coverage.county.data.attributes] - Attributes of the county.
 * @param {string} [props.coverage.county.data.attributes.name] - Name of the county.
 * @param {number} [props.commencement] - The year the freelancer started their business.
 * @param {string} [props.website] - The freelancer's website URL.
 * @param {string} [props.phone] - The freelancer's primary phone number.
 * @param {string} [props.viber] - The freelancer's Viber phone number.
 * @param {string} [props.whatsapp] - The freelancer's WhatsApp phone number.
 * @param {string} [props.email] - The freelancer's email address.
 * @param {string | number} [props.fid] - The ID of the freelancer.
 * @param {string | number} [props.freelancerId] - The ID of the freelancer profile.
 * @param {boolean} [props.isOwner] - Whether the current viewer is the owner of the profile.
 * @returns {JSX.Element} The Info component.
 */
export default function Info({
  rate,
  coverage,
  commencement,
  website,
  phone,
  viber,
  whatsapp,
  email,
  fid,
  freelancerId,
  isOwner,
}) {
  /**
   * Formats the website URL by removing the protocol (http:// or https://).
   * @type {string | null}
   */
  const formattedWebsite = website ? website.replace(/^https?:\/\//, "") : null;

  /**
   * State to control the visibility of the phone number.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [showPhone, setShowPhone] = useState(false);

  /**
   * State to control the visibility of the email address.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [showEmail, setShowEmail] = useState(false);

  /**
   * Array of strings describing the service coverage types based on the coverage prop.
   * @type {string[]}
   */
  const covers = [];
  if (coverage?.online) covers.push("Online");
  if (coverage?.onbase) covers.push("Στην έδρα");
  if (coverage?.onsite) covers.push("Στον χώρο σας");

  /**
   * Tracks the revealing of contact information (phone or email) using Google Analytics gtag.
   * Also updates the corresponding state (showPhone or showEmail) to true.
   * @param {'phone' | 'email'} contactType - The type of contact information being revealed.
   */
  const trackContactReveal = (contactType) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "reveal_contact", {
        event_category: "Contact",
        event_label: contactType,
        value: 1,
      });
    }

    if (contactType === "phone") {
      setShowPhone(true);
    } else if (contactType === "email") {
      setShowEmail(true);
    }
  };

  return (
    <>
      <div className="price-widget pt25 bdrs8 prowidget">
        {rate && (
          <h3 className="widget-title mb30">
            {rate}€<small className="fz15 fw500"> / ώρα</small>
          </h3>
        )}

        <div className="category-list mt20">
          {coverage?.county?.data && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-3">
              <span className="text">
                <i className="flaticon-place text-thm2 pe-2 vam" />
                <span className="list-item-title">Περιοχή</span>
              </span>
              <span>{coverage?.county?.data?.attributes?.name}</span>
            </div>
          )}
          {covers.length > 0 && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-3">
              <span className="text">
                <i className="flaticon-customer-service text-thm2 pe-2 vam" />
                <span className="list-item-title">Εξυπηρετεί</span>
              </span>
              <div className="freelancer-info-chips">
                {covers.map((el, i) => (
                  <span key={i} className="freelancer-info-chip">
                    {el}
                  </span>
                ))}
              </div>
            </div>
          )}
          {commencement && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-3">
              <span className="text">
                <i className="flaticon-calendar text-thm2 pe-2 vam" />
                <span className="list-item-title">Έτος Έναρξης</span>
              </span>
              <span>{commencement}</span>
            </div>
          )}{" "}
          {formattedWebsite && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-3">
              <span className="text">
                <i className="flaticon-website text-thm2 pe-2 vam" />
                <span className="list-item-title">Ιστοσελίδα</span>
              </span>
              <a href={website} target="_blank" rel="noopener">
                {formattedWebsite}
              </a>
            </div>
          )}
          {phone && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-3">
              <span className="text">
                <i className="flaticon-call text-thm2 pe-2 vam" />
                <span className="list-item-title">Τηλέφωνο</span>
              </span>
              <div className="d-flex align-items-center">
                {viber && (
                  <a
                    href={`viber://chat/?number=%2B30${String(viber).replace(
                      /\D/g,
                      ""
                    )}`}
                    className="me-2"
                    title={`Viber: ${viber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i
                      className="fab fa-viber"
                      style={{
                        color: "#665CAC",
                        fontSize: "1.3em",
                      }}
                    ></i>
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={`whatsapp://send?phone=%2B30${String(
                      whatsapp
                    ).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="me-2"
                    title={`Whatsapp: ${whatsapp}`}
                  >
                    <i
                      className="fab fa-whatsapp"
                      style={{
                        color: "#25D366",
                        fontSize: "1.45em",
                      }}
                    ></i>
                  </a>
                )}
                {showPhone ? (
                  <a href={`tel:${phone}`}>{phone}</a>
                ) : (
                  <button
                    onClick={() => trackContactReveal("phone")}
                    style={{
                      color: "#198754",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    id="show-phone-btn"
                  >
                    Προβολή
                  </button>
                )}
              </div>
              <a href={`tel:${phone}`} style={{ display: "none" }}>
                {phone}
              </a>
            </div>
          )}
          {email && (
            <div className="list-item d-flex align-items-center justify-content-between bdrb1 pb-3">
              <span className="text">
                <i className="flaticon-mail text-thm2 pe-2 vam" />
                <span className="list-item-title">Email</span>
              </span>
              {showEmail ? (
                <a href={`mailto:${email}`}>{email}</a>
              ) : (
                <button
                  onClick={() => trackContactReveal("email")}
                  style={{
                    color: "#198754",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  id="show-email-btn"
                >
                  Προβολή
                </button>
              )}
              <a href={`mailto:${email}`} style={{ display: "none" }}>
                {email}
              </a>
            </div>
          )}
        </div>

        {/* Conditionally render the contact button if not the owner and required IDs are present */}
        {!isOwner && fid && freelancerId && (
          <div className="d-grid mt30">
            <button
              type="button"
              className="ud-btn btn-thm"
              data-bs-toggle="modal"
              data-bs-target="#startChatModal"
              // onClick={handleButtonClick}
              // disabled={isPending} // Only disable when action is pending
            >
              Επικοινωνία <i className="fal fa-arrow-right-long" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
