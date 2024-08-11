import React from "react";
import { featuresData } from "../data";

export default function Features() {
  return (
    <section className="our-features pb90 pb30-md pt-0">
      <div className="container wow fadeInUp">
        <div className="row">
          <div className="col-lg-12">
            <div className="main-title text-center">
              <h2>Ψάχνετε κάποια υπηρεσία;</h2>
              <h3 className="text">
                Βρες Επαγγελματίες και Υπηρεσίες που Ταιριάζουν στις Ανάγκες
                σου.
              </h3>
            </div>
          </div>
        </div>
        <div className="row">
          {featuresData.map((feature, index) => (
            <div key={index} className="col-sm-6 col-lg-3">
              <div className="iconbox-style1 at-home12 p-0 text-center">
                <div className="icon before-none">
                  <span className={feature.iconClass}></span>
                </div>
                <div className="details">
                  <h4 className="title mt10 mb-3">{feature.title}</h4>
                  <p
                    className="text"
                    dangerouslySetInnerHTML={{ __html: feature.description }}
                  ></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
