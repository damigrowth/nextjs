"use client";

import { getPathname } from "@/utils/paths";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import BannerVidBtn from "./BannerVidBtn";
import BannerVidBox from "./BannerVidBox";

export default function Banner({ categories, heading, description }) {
  const pathName = usePathname();
  const category = getPathname(pathName, 1);
  const subcategory = getPathname(pathName, 2);

  // Find the current category from the array of categories
  const currentCategory = categories.find(
    (cat) => cat.attributes.slug === category
  );

  const currentSubcategory =
    currentCategory?.attributes?.subcategories?.data?.find(
      (sub) => sub.attributes.slug === subcategory
    );

  // Use subcategory if it exists, otherwise use the category
  const displayData = currentSubcategory
    ? currentSubcategory.attributes
    : currentCategory?.attributes;

  const bannerImage = !currentCategory?.attributes?.image?.data
    ? "/images/vector-img/vector-service-v1.png"
    : currentCategory?.attributes?.image?.data?.attributes?.formats?.small?.url;

  const bannerTitle =
    !category && !subcategory
      ? heading
      : displayData?.plural
      ? displayData.plural
      : displayData?.label;

  const bannerDescription =
    !category && !subcategory ? description : displayData?.description;

  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="cta-service-v1 cta-banner mx-auto maxw1700 pt120 pb120 bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg bg-white">
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
            src={bannerImage}
            alt="vector"
          />
          <div className="container">
            <div className="row wow fadeInUp">
              <div className="col-xl-5">
                <div className="position-relative">
                  <h1 className="heading-h2">{bannerTitle}</h1>
                  <h2 className="heading-p mb-0 mb20">{bannerDescription}</h2>
                  {!category && !subcategory && <BannerVidBtn />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {!category && !subcategory && <BannerVidBox />}
    </>
  );
}
