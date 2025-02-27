"use client";

import { useState } from "react";
import FaqListEdit from "./FaqListEdit";
import useCreateServiceStore from "@/store/service/create/createServiceStore";
import useEditServiceStore from "@/store/service/edit/editServiceStore";

export default function FaqList({ custom, editMode = false }) {
  // Choose the appropriate store based on editMode prop
  const store = editMode ? useEditServiceStore : useCreateServiceStore;

  const { faq, deleteFaq, editFaq, faqEditingMode, faqEditingInput } = store();
  const [activeItem, setActiveItem] = useState(0);

  const toggleAccordion = (id) => {
    setActiveItem(id === activeItem ? null : id);
  };

  console.log("faq", faq);

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
          {faq.map((faqItem, id) => (
            <div key={id}>
              <div
                className={`accordion-item ${
                  activeItem === id ? "active" : "collapsed"
                }`}
              >
                <h2 className="accordion-header" id={`heading${id}`}>
                  <button
                    className={`accordion-button justify-content-between ${
                      activeItem === id ? "" : "collapsed"
                    }`}
                    type="button"
                    onClick={() => toggleAccordion(id)}
                    style={{ backgroundColor: "white" }}
                  >
                    {faqItem.question}
                    <div className="pr35">
                      <button
                        type="button"
                        onClick={() => deleteFaq(id)}
                        className="btn float-end p0"
                      >
                        <span className="text-thm2 flaticon-delete fz16 d-flex p-2 " />
                      </button>

                      <button
                        type="button"
                        onClick={() => editFaq(id)}
                        className="btn float-end p0"
                      >
                        <span className="text-thm2 flaticon-pencil fz16 d-flex p-2" />
                      </button>
                    </div>
                  </button>
                </h2>
                <div
                  id={`collapse${id}`}
                  className={`accordion-collapse collapse ${
                    activeItem === id ? "show" : ""
                  }`}
                  aria-labelledby={`heading${id}`}
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
              {faqEditingMode && faqEditingInput === id ? (
                <FaqListEdit id={id} editMode={editMode} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
