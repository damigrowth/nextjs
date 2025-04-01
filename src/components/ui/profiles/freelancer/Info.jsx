"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function Info({
  rate,
  coverage,
  commencement,
  website,
  phone,
  email,
}) {
  // console.log(coverage);
  const formattedWebsite = website ? website.replace(/^https?:\/\//, "") : null;
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const covers = [];
  if (coverage?.online) covers.push("Online");
  if (coverage?.onbase) covers.push("Στην έδρα");
  if (coverage?.onsite) covers.push("Στον χώρο σας");
  
  // Συνάρτηση για tracking των κλικ στο Google Analytics
  const trackContactReveal = (contactType) => {
    // Έλεγχος αν το window και το gtag υπάρχουν (client-side)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'reveal_contact', {
        'event_category': 'Contact',
        'event_label': contactType,
        'value': 1
      });
    }
    
    // Ενημερώνουμε το state ανάλογα με τον τύπο επικοινωνίας
    if (contactType === 'phone') {
      setShowPhone(true);
    } else if (contactType === 'email') {
      setShowEmail(true);
    }
  };

  return (
    <>
      <div className="price-widget pt25 bdrs8 prowidget">
        {rate && (
          <h3 className="widget-title mb30">
            {}
            {rate}€<small className="fz15 fw500"> / εργατοώρα</small>
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
          {covers && (
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
              {showPhone ? (
                <a href={`tel:${phone}`}>{phone}</a>
              ) : (
                <button 
                  onClick={() => trackContactReveal('phone')} 
                  style={{ color: "#198754", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  id="show-phone-btn"
                >
                  Προβολή
                </button>
              )}
              {/* Κρυφό link για SEO */}
              <a href={`tel:${phone}`} style={{ display: 'none' }}>{phone}</a>
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
                  onClick={() => trackContactReveal('email')} 
                  style={{ color: "#198754", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  id="show-email-btn"
                >
                  Προβολή
                </button>
              )}
              {/* Κρυφό link για SEO */}
              <a href={`mailto:${email}`} style={{ display: 'none' }}>{email}</a>
            </div>
          )}
        </div>

        <div className="d-grid mt30">
          <Link href="#" className="ud-btn btn-thm">
            Επικοινωνία
            <i className="fal fa-arrow-right-long" />
          </Link>
        </div>
      </div>
    </>
  );
}
