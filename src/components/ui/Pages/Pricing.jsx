"use client";

import { useState } from "react";
import PlanCard from "./PlanCard";

export default function Pricing({ data }) {
  const [isYearly, setIsYearly] = useState(false);

  // monthly & yearly price handler
  const checkboxHandler = (e) => {
    setIsYearly(e.target.checked);
  };

  return (
    <section className="our-pricing">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 m-auto wow fadeInUp">
            <div className="main-title text-center mb30">
              <h2 className="title">{data.title}</h2>
              <p className="paragraph mt10">{data.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="row wow fadeInUp" data-wow-delay="200ms">
          <div className="col-lg-12">
            <div className="pricing_packages_top d-flex align-items-center justify-content-center mb60">
              <div className="toggle-btn">
                <span className="pricing_save1 dark-color ff-heading">
                  {data.billingOptions.monthly}
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    id="checbox"
                    onChange={checkboxHandler}
                  />
                  <span className="pricing_table_switch_slide round" />
                </label>
                <span className="pricing_save2 dark-color ff-heading">
                  {data.billingOptions.yearly}
                </span>
                <span className="pricing_save3">
                  {data.billingOptions.saveText}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="row wow fadeInUp" data-wow-delay="300ms">
          {data.plans.map((item, i) => (
            <div key={i} className="col-sm-6 col-xl-3">
              <PlanCard data={{ ...item, price: isYearly ? "1y" : "1m" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
