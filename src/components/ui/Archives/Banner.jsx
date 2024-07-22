import Image from "next/image";
import React from "react";

export default function Banner({ category, categories }) {
  // Find the current category from the array of categories
  const currentCategory = categories.find(
    (cat) => cat.attributes.slug === category
  );

  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="cta-service-v1 cta-banner mx-auto maxw1700 pt120 pb120 bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg">
          <Image
            height={226}
            width={198}
            className="left-top-img wow zoomIn"
            src="/images/vector-img/left-top.png"
            alt="vector"
          />
          <Image
            height={181}
            width={255}
            className="right-bottom-img wow zoomIn"
            src="/images/vector-img/right-bottom.png"
            alt="vector"
          />
          <Image
            height={300}
            width={532}
            className="service-v1-vector bounce-y d-none d-lg-block"
            src={
              !currentCategory.attributes.image.data
                ? "/images/vector-img/vector-service-v1.png"
                : currentCategory.attributes.image.data.attributes.formats.small
                    .url
            }
            alt="vector"
          />
          <div className="container">
            <div className="row wow fadeInUp">
              <div className="col-xl-5">
                <div className="position-relative">
                  <h2>
                    {" "}
                    {!currentCategory?.attributes?.plural
                      ? currentCategory?.attributes?.label
                      : currentCategory?.attributes?.plural}
                  </h2>
                  <p className="text mb-0">
                    {currentCategory?.attributes?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
