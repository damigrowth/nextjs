"use client";

import { useState } from "react";
import FaqListEdit from "./FaqListEdit";
import useCreateServiceStore from "@/store/service/createServiceStore";

export default function FaqList({ custom }) {
  const { faq, deleteFaq, editFaq, editingMode, editingInput } =
    useCreateServiceStore();
  const [activeItem, setActiveItem] = useState(0);

  const toggleAccordion = (index) => {
    setActiveItem(index === activeItem ? null : index);
  };

  return (
    <>
      <div
        className={
          custom
            ? "accordion-style1 faq-page"
            : "accordion-style1 faq-page mb-4 mb-lg-5 mt30"
        }
      >
        <div className="accordion" id="accordion">
          {faq.map((faqItem, index) => (
            <div key={index}>
              <div
                className={`accordion-item ${
                  activeItem === index ? "active" : "collapsed"
                }`}
              >
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className={`accordion-button justify-content-between ${
                      activeItem === index ? "" : "collapsed"
                    }`}
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    style={{ backgroundColor: "white" }}
                  >
                    {faqItem.question}
                    <div className="pr35">
                      <button
                        type="button"
                        onClick={() => deleteFaq(index)}
                        className="btn float-end p0"
                      >
                        <span className="text-thm2 flaticon-delete fz16 d-flex p-2 " />
                      </button>

                      <button
                        type="button"
                        onClick={() => editFaq(index)}
                        className="btn float-end p0"
                      >
                        <span className="text-thm2 flaticon-pencil fz16 d-flex p-2" />
                      </button>
                    </div>
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
                  <div
                    className="accordion-body"
                    style={{ backgroundColor: "white" }}
                  >
                    {faqItem.answer}
                  </div>
                </div>
              </div>
              {editingMode && editingInput === index ? (
                <FaqListEdit index={index} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
