import React from "react";
import Skeleton from "react-loading-skeleton";
import StickySidebar from "../sticky/StickySidebar";

export default function SingleServiceSkeleton() {
  return (
    <>
      <section className="categories_list_section overflow-hidden">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="listings_category_nav_list_menu">
                <div className="mb0 d-flex ps-0">
                  <Skeleton
                    width={1000}
                    height={25}
                    borderRadius={12}
                    style={{ marginBottom: "8px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="bgc-thm3">
        <section className="breadcumb-section">
          <div className="container">
            <div className="row">
              <div className="col-sm-8 col-lg-10">
                <div className="breadcumb-style1 mb10-xs">
                  <div className="breadcumb-list">
                    <Skeleton width={400} height={25} borderRadius={12} />
                  </div>
                </div>
              </div>
              <div className="col-sm-4 col-lg-2">
                <div className="d-flex align-items-center justify-content-sm-end">
                  <Skeleton
                    width={29}
                    height={29}
                    borderRadius={60}
                    style={{ marginRight: "10px" }}
                  />
                  <Skeleton
                    width={100}
                    height={20}
                    borderRadius={12}
                    style={{ marginRight: "20px" }}
                  />
                  <Skeleton
                    width={29}
                    height={29}
                    borderRadius={60}
                    style={{ marginRight: "10px" }}
                  />
                  <Skeleton width={100} height={20} borderRadius={12} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="pt10 pb90 pb30-md bg-orange">
          <div className="container">
            <div className="row wrap service-wrapper">
              <div className="col-lg-8">
                <div className="column">
                  <div className="row  px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                    <div className="col-xl-12 mb30 pb30 bdrb1">
                      <div className="position-relative">
                        <h1 className="heading-h2">
                          <Skeleton width={860} height={38} borderRadius={12} />
                        </h1>
                        <div className="list-meta meta mt30">
                          <Skeleton
                            width={40}
                            height={40}
                            borderRadius={"20%"}
                          />
                          <Skeleton width={140} height={20} borderRadius={12} />
                          <Skeleton width={120} height={20} borderRadius={12} />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      {Array.from({ length: 3 }).map((item, index) => (
                        <div className="col-sm-6 col-md-4" key={index}>
                          <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                            <div className="icon flex-shrink-0">
                              <Skeleton
                                width={40}
                                height={40}
                                borderRadius={"20%"}
                              />
                            </div>
                            <div className="details">
                              <Skeleton
                                width={120}
                                height={20}
                                borderRadius={12}
                              />
                              <Skeleton
                                width={100}
                                height={15}
                                borderRadius={12}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="service-about">
                    <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                      <Skeleton
                        width={120}
                        height={26}
                        borderRadius={12}
                        style={{ marginBottom: "20px" }}
                      />
                      <div className="text mb30 rich-text-editor">
                        <div className="freelancer-description text mb30">
                          {Array.from({ length: 3 }).map((item, index) => (
                            <div className="mb10" key={index}>
                              <Skeleton
                                width={620}
                                height={15}
                                borderRadius={12}
                              />
                              <Skeleton
                                width={820}
                                height={15}
                                borderRadius={12}
                              />
                              <Skeleton
                                width={420}
                                height={15}
                                borderRadius={12}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="list1">
                          <Skeleton width={120} height={20} borderRadius={12} />
                          <ul className="tags">
                            {Array.from({ length: 3 }).map((item, index) => (
                              <li key={index}>
                                <Skeleton
                                  width={100}
                                  height={25}
                                  borderRadius={60}
                                  style={{ marginRight: "6px" }}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <StickySidebar>
                <div className="price-widget">
                  <div className="price mb40">
                    <Skeleton
                      width={50}
                      height={31}
                      borderRadius={12}
                      // style={{ marginRight: "6px" }}
                    />
                  </div>
                  <div class="pb-0 bg-white bdrs12 wow fadeInUp default-box-shadow1 ">
                    <div class="extra-service-tab mb20 mt20">
                      <nav>
                        <div class="nav flex-column nav-tabs">
                          <button class="small-addon">
                            <label class="small-addon-container">
                              <div class="small-addon-content">
                                <h5 class="small-addon-title">
                                  <Skeleton
                                    width={130}
                                    height={19}
                                    borderRadius={12}
                                    style={{ marginBottom: "6px" }}
                                  />
                                </h5>
                                <div class="small-addon-description">
                                  <Skeleton
                                    width={270}
                                    height={15}
                                    borderRadius={12}
                                    // style={{ marginRight: "6px" }}
                                  />
                                  <Skeleton
                                    width={210}
                                    height={15}
                                    borderRadius={12}
                                    // style={{ marginRight: "6px" }}
                                  />
                                </div>
                                <div class="small-addon-price"></div>
                              </div>

                              <Skeleton
                                width={19}
                                height={19}
                                borderRadius={4}
                                style={{
                                  position: "absolute",
                                  left: "0px",
                                  top: "3px",
                                }}
                              />
                            </label>
                          </button>
                        </div>
                      </nav>
                    </div>
                  </div>
                  <div className="d-grid">
                    <Skeleton
                      width={308}
                      height={59}
                      borderRadius={4}
                      // style={{ marginRight: "6px" }}
                    />
                  </div>
                </div>
                <div className="freelancer-style1 service-single mb-0">
                  <div className="wrapper d-flex align-items-center">
                    <div className="thumb position-relative">
                      <Skeleton
                        width={90}
                        height={90}
                        borderRadius={"20%"}
                        style={{ marginRight: "10px" }}
                      />
                    </div>
                    <div className="ml20">
                      <h5 className="title mb-1">
                        <Skeleton width={100} height={19} borderRadius={12} />
                      </h5>
                      <p className="mb-0">
                        <Skeleton width={130} height={14} borderRadius={12} />
                      </p>
                      <Skeleton width={160} height={14} borderRadius={12} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-end mb-0  fz15 fw500 list-inline-item ml15 mb5-sm ml0-xs">
                    <div
                      className="social-style1 light-style2 socials-list"
                      style={{ gap: "6px" }}
                    >
                      {Array.from({ length: 5 }).map((item, index) => (
                        <div key={index}>
                          <Skeleton width={40} height={40} borderRadius={12} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr className="opacity-100" />
                  <div className="details">
                    <div className="fl-meta d-flex align-items-center justify-content-between">
                      <div className="contact-meta-info left">
                        <Skeleton width={98} height={18} borderRadius={12} />
                        <Skeleton width={115} height={18} borderRadius={12} />
                      </div>
                      <div className="contact-meta-info right">
                        <Skeleton width={70} height={18} borderRadius={12} />
                        <Skeleton width={97} height={18} borderRadius={12} />
                      </div>
                    </div>
                  </div>
                  <div className="d-grid mt30">
                    <Skeleton
                      width={308}
                      height={59}
                      borderRadius={4}
                      // style={{ marginRight: "6px" }}
                    />
                  </div>
                </div>
              </StickySidebar>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
