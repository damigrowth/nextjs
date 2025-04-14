import Image from "next/image";
import React from "react";

export default function Cta2({ data }) {
  return (
    <section className="cta-banner-about2 mx-auto maxw1700 position-relative mx20-lg pt60-lg pb60-lg">
      <Image
        height={701}
        width={717}
        className="cta-about2-img d-none d-xl-block h-100 object-fit-contain"
        src={data.image}
        alt="about"
      />
      <div className="container">
        <div className="row">
          <div className="col-md-11 wow fadeInUp" data-wow-delay="200ms">
            <div className="main-title">
              <h2 className="title text-capitalize">{data.title}</h2>
              <p className="text">{data.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="row wow fadeInDown" data-wow-delay="400ms">
          {data.boxes.map((box, index) => (
            <div key={index} className="col-sm-6 col-lg-4 col-xl-3">
              <div className="iconbox-style9 default-box-shadow1 bgc-white p20 bdrs12 position-relative mb30">
                <span className={`icon fz40 ${box.icon}`} />
                <h4 className="iconbox-title mt20">{box.title}</h4>
                <p className="text mb-0">
                  {box.description.split("<br />").map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < box.description.split("<br />").length - 1 && (
                        <br className="d-none d-md-block" />
                      )}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
