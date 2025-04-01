"use client";

import { useState } from "react";
import ReactStars from "react-stars";

export default function ServiceDetailComment1() {
  const [rating, setRating] = useState(5);

  const handleRatingChange = (value) => {
    setRating(value);
  };
  return (
    <>
      <div className="bsp_reveiw_wrt p30 mt40 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
        <h6 className="fz17">Προσθήκη Αξιολόγησης</h6>
        <p className="text">
          Δεν θα δημοσιευθεί το email σας, μόνο το username.
        </p>
        <h6>Βαθμολογία</h6>
        <ReactStars
          count={5}
          value={rating}
          half={false}
          onChange={handleRatingChange}
          size={24}
          color2={"#ffd700"}
        />
        <form className="comments_form mt30 mb30-md">
          <div className="row">
            <div className="col-md-12">
              <div className="mb-4">
                <label className="fw500 fz16 ff-heading dark-color mb-2">
                  Αξιολόγηση
                </label>
                <textarea
                  className="pt15"
                  rows={6}
                  placeholder="Η υπηρεσία ήταν εξαιρετική!"
                />
              </div>
            </div>

            <div className="col-md-12">
              <a className="ud-btn btn-thm">
                Αποστολή
                <i className="fal fa-arrow-right-long" />
              </a>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
