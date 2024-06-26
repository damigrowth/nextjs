"use client";

import InputB from "@/components/inputs/InputB";
import useCreateServiceStore from "@/store/service/createServiceStore";
import React from "react";

export default function FaqListEdit({ index }) {
  const {
    editingFaq,
    errors,
    cancelEditingFaq,
    saveEditingFaq,
    setEditingFaq,
  } = useCreateServiceStore();

  // console.log("errors", errors);

  return (
    <div colSpan="10" className="table-editing-bg pt30 pb30">
      <h5 className="table-editing-bg ml30 p0">Επεξεργασία παροχής</h5>
      <div className="table-editing-bg p0 mt30">
        <div className="px30">
          <div className="row">
            <div className="mb20 form-group">
              <InputB
                label="Αλλαγή Ερώτησης"
                type="text"
                id="editing-faq-question"
                name="editing-faq-question"
                maxLength={20}
                value={editingFaq.question}
                onChange={(formattedValue) =>
                  setEditingFaq("question", formattedValue)
                }
                className="form-control input-group"
                errors={errors}
                formatNumbers
                formatSymbols
                capitalize
              />
            </div>
          </div>
          <div className="row">
            <div className="form-group">
              <InputB
                label="Αλλαγή Απάντησης"
                type="text"
                id="editing-faq-answer"
                name="editing-faq-answer"
                maxLength={20}
                value={editingFaq.answer}
                onChange={(formattedValue) =>
                  setEditingFaq("answer", formattedValue)
                }
                className="form-control input-group"
                errors={errors}
                formatNumbers
                formatSymbols
                capitalize
              />
            </div>
          </div>
        </div>
      </div>
      <div className="table-editing-bg p0 mt30">
        <div className="px30">
          <div className="row">
            <div className="col-sm-6 text-start">
              <button
                type="button"
                onClick={cancelEditingFaq}
                className="ud-btn btn-dark-border"
              >
                Ακύρωση
              </button>
            </div>
            <div className="col-sm-6 text-end">
              <button
                type="button"
                onClick={saveEditingFaq}
                className="ud-btn btn-thm"
              >
                Αποθήκευση
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
