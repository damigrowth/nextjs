"use client";

import React, { useState } from "react";

export default function Faq({ faq }) {
  if (faq.length === 0) {
    return;
  }
  const [activeItem, setActiveItem] = useState(0);

  const toggleAccordion = (index) => {
    setActiveItem(index === activeItem ? null : index);
  };
  return (
    <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
      <h4>Συχνές Ερωτήσεις</h4>
      <div className="accordion-style1 faq-page mb-4 mb-lg-5 mt30">
        <div className="accordion" id="accordion">
          {faq.map((faqItem, index) => (
            <div
              key={index}
              className={`accordion-item ${
                activeItem === index ? "active" : "collapsed"
              }`}
            >
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className={`accordion-button ${
                    activeItem === index ? "" : "collapsed"
                  }`}
                  type="button"
                  onClick={() => toggleAccordion(index)}
                >
                  {faqItem.question}
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className={`accordion-collapse collapse ${
                  activeItem === index ? "show" : ""
                }`}
                aria-labelledby={`heading${index}`}
                data-bs-parent="#accordion"
              >
                <div className="accordion-body">{faqItem.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
