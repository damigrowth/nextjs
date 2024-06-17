import { freelancer1 } from "@/data/product";
import React from "react";
import Meta from "./Meta";
import Metrics from "./Metrics";
import Description from "./Description";
import Education from "./Education";
import Experience from "./Experience";
import Certificates from "./Certificates";
import Featured from "./Featured";
import Reviews from "./Reviews";
import StickySidebar from "@/components/sticky/StickySidebar";
import Info from "./Info";
import Skills from "./Skills";

export default function FreelancerProfile() {
  const data = freelancer1.find((item) => item.id == 2);
  return (
    <section className="pt10 pb90 pb30-md">
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-8">
            <Meta data={data} />
            <Metrics />
            <div className="service-about">
              <Description />
              <hr className="opacity-100 mb60 mt60" />
              <Education />
              <hr className="opacity-100 mb60" />
              <Experience />
              <hr className="opacity-100 mb60" />
              <Certificates />
              <hr className="opacity-100 mb60" />
              <Featured />
              <hr className="opacity-100" />
              <Reviews />
            </div>
          </div>
          <StickySidebar>
            <Info />
            <Skills />
          </StickySidebar>
        </div>
      </div>
    </section>
  );
}
