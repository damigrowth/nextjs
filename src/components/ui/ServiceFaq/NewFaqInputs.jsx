"use client";

import InputB from "@/components/inputs/InputB";
import useCreateServiceStore from "@/store/service/createServiceStore";
import React from "react";

export default function NewFaqInputs() {
  const { newFaq, setNewFaq, clearNewFaq, saveNewFaq, errors } =
    useCreateServiceStore();

  // console.log("ERRORS", errors);
  // console.log("newFaq", newFaq);

  return (
    <>
      <div className="mt20">
        <div className="bdrs4 p30">
          <div className="row">
            <div className="mb20 form-group">
              <InputB
                label="Ερώτηση"
                type="text"
                id="faq-question"
                name="faq-question"
                minLength={10}
                maxLength={80}
                value={newFaq.question}
                onChange={(formattedValue) =>
                  setNewFaq("question", formattedValue)
                }
                className="form-control input-group"
                errors={errors}
                capitalize
              />
            </div>
          </div>
          <div className="row">
            <div className="mb20 form-group">
              <InputB
                label="Απάντηση"
                type="text"
                id="faq-answer"
                name="faq-answer"
                minLength={2}
                maxLength={300}
                value={newFaq.answer}
                onChange={(formattedValue) =>
                  setNewFaq("answer", formattedValue)
                }
                className="form-control input-group"
                errors={errors}
                capitalize
              />
            </div>
          </div>

          {errors.field === "faq" ? (
            <div>
              <p className="text-danger">{errors.message}</p>
            </div>
          ) : null}

          <div className="row pt20 ">
            <div className="col-sm-6 text-start">
              <button
                type="button"
                onClick={clearNewFaq}
                className="ud-btn btn-dark-border  "
              >
                Ακύρωση
              </button>
            </div>
            <div className="col-sm-6 text-end">
              <button
                type="button"
                onClick={saveNewFaq}
                className="ud-btn btn-thm "
              >
                Αποθήκευση
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
