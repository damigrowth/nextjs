// import { Sticky, StickyContainer } from "react-sticky";

import Avatar from "../avatars/Avatar";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import Image from "next/image";
import JsonViewer from "../json/JsonViewer";
import ServiceContactWidget1 from "../element/ServiceContactWidget1";
import ServiceDetailComment1 from "../element/ServiceDetailComment1";
import ServiceDetailExtra1 from "../element/ServiceDetailExtra1";
import ServiceDetailFaq1 from "../element/ServiceDetailFaq1";
import ServiceDetailPrice1 from "../element/ServiceDetailPrice1";
import ServiceDetailReviewInfo1 from "../element/ServiceDetailReviewInfo1";
import ServiceDetailSlider1 from "../element/ServiceDetailSlider1";
import ServiceDetailSlider2 from "../element/ServiceDetailSlider2";
import { getService } from "@/lib/service";
import { useParams } from "next/navigation";

// import { product1 } from "@/data/product";
// import { useParams } from "next/navigation";
// import useScreen from "@/hook/useScreen";

export default async function ServiceDetail3({ service }) {
  // const isMatchedScreen = useScreen(1216);

  // console.log("Service====>", service.description);

  if (!service) {
    return (
      <div>
        <p>Παρακαλώ περιμένετε...</p>
      </div>
    );
  }

  return (
    <>
      {/* <StickyContainer> */}
      {/* <JsonViewer data={service} /> */}
      <section className="pt10 pb90 pb30-md">
        <div className="container">
          <div className="row wrap">
            <div className="col-lg-8">
              <div className="column">
                <div className="row  px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                  <div className="col-xl-12 mb30 pb30 bdrb1">
                    <div className="position-relative">
                      <h2>{service.title}</h2>
                      {/* <div className="list-meta mt30">
                        <a className="list-inline-item mb5-sm" href="#">
                          <span className="position-relative mr10">
                            {!service.freelancer.data.attributes.avatar ? (
                              <Image
                                width={40}
                                height={40}
                                className="rounded-circle"
                                src="/images/team/fl-d-1.png"
                                alt="Freelancer Photo"
                              />
                            ) : (
                              <Avatar
                                firstName={
                                  service.freelancer.data.attributes.firstName
                                }
                                lastName={
                                  service.freelancer.data.attributes.lastName
                                }
                                avatar=""
                              />
                            )}

                            <span className="online-badge"></span>
                          </span>
                          <span className="fz14">
                            {service.freelancer.data.attributes.displayName}
                          </span>
                        </a>
                        <p className="mb-0 dark-color fz14 list-inline-item ml25 ml15-sm mb5-sm ml0-xs">
                          <i className="fas fa-star vam fz10 review-color me-2"></i>{" "}
                          4.82 94 reviews
                        </p>
                        <p className="mb-0 dark-color fz14 list-inline-item ml25 ml15-sm mb5-sm ml0-xs">
                          <i className="flaticon-file-1 vam fz20 me-2"></i> 2
                          Order in Queue
                        </p>
                        <p className="mb-0 dark-color fz14 list-inline-item ml25 ml15-sm mb5-sm ml0-xs">
                          <i className="flaticon-website vam fz20 me-2"></i> 902
                          Views
                        </p>
                      </div> */}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6 col-md-4">
                      <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                        <div className="icon flex-shrink-0">
                          <span className="flaticon-calendar" />
                        </div>
                        <div className="details">
                          <h5 className="title">Χρόνος Παράδωσης</h5>
                          <p className="mb-0 text">{service.time} Μέρες</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-md-4">
                      <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                        <div className="icon flex-shrink-0">
                          <span className="flaticon-goal" />
                        </div>
                        <div className="details">
                          <h5 className="title">English Level</h5>
                          <p className="mb-0 text">Professional</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-md-4">
                      <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                        <div className="icon flex-shrink-0">
                          <span className="flaticon-tracking" />
                        </div>
                        <div className="details">
                          <h5 className="title">Περιοχή</h5>
                          <p className="mb-0 text">
                            {/* {service.city.data.attributes.title} */}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <ServiceDetailSlider2 />
                <div className="service-about">
                  <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                    <h4>Περιγραφή</h4>
                    <div className="text mb30 rich-text-editor">
                      <p>{service.description}</p>
                      {/* <BlocksRenderer content={service.description} /> */}
                    </div>
                  </div>

                  <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                    <h4>Compare Packages</h4>
                    <div className="table-style2 table-responsive bdr1 mt30 mb60">
                      <table className="table table-borderless mb-0">
                        <thead className="t-head">
                          <tr>
                            <th className="col " scope="col" />
                            {service.packages.map((pack) => (
                              <th key={pack.id} className="col w25" scope="col">
                                <span className="h2">{pack.price}€</span>
                                <br />
                                <span className="h4">{pack.title}</span>
                                <br />
                                <span className="text">{pack.description}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="t-body">
                          {service.packages[0].features.map(
                            (feature, featureIndex) => (
                              <tr className="bgc-thm3" key={featureIndex}>
                                <th scope="row">{feature.title}</th>
                                {service.packages.map((pack, index) => (
                                  <td key={index}>
                                    {pack.features[featureIndex]
                                      .isCheckField ? (
                                      <div
                                        className={
                                          pack.features[featureIndex].checked
                                            ? "check_circle bgc-thm"
                                            : "check_circle bgc-red"
                                        }
                                      >
                                        <span
                                          className={
                                            pack.features[featureIndex].checked
                                              ? "fas fa-check"
                                              : "fas fa-times"
                                          }
                                        />
                                      </div>
                                    ) : (
                                      pack.features[featureIndex].value
                                    )}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}

                          <tr>
                            <th scope="row" />
                            <td>
                              <a className="ud-btn btn-thm">
                                Select
                                <i className="fal fa-arrow-right-long" />
                              </a>
                            </td>
                            <td>
                              <a className="ud-btn btn-thm">
                                Select
                                <i className="fal fa-arrow-right-long" />
                              </a>
                            </td>
                            <td>
                              <a className="ud-btn btn-thm">
                                Select
                                <i className="fal fa-arrow-right-long" />
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>{" "}
                  </div>
                  {/* <hr className="opacity-100 mb60" /> */}
                  <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                    <h4>Συχνές Ερωτήσεις</h4>
                    <ServiceDetailFaq1 faq={service.faq} />{" "}
                  </div>
                  {/* <hr className="opacity-100 mb60" /> */}
                  <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                    <h4>Extra Υπηρεσίες</h4>
                    <ServiceDetailExtra1 addons={service.addons} />{" "}
                  </div>
                  {/* <hr className="opacity-100 mb15" /> */}
                  <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                    <ServiceDetailReviewInfo1 />
                    <ServiceDetailComment1 />
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="col-lg-4">
                <div className="column">
                  {isMatchedScreen ? (
                    <Sticky>
                      {({ style }) => (
                        <div className="scrollbalance-inner" style={style}>
                          <div className="blog-sidebar ms-lg-auto">
                            <ServiceDetailPrice1 />
                            <ServiceContactWidget1 />
                          </div>
                        </div>
                      )}
                    </Sticky>
                  ) : (
                    <div className="scrollbalance-inner">
                      <div className="blog-sidebar ms-lg-auto">
                        <ServiceDetailPrice1 />
                        <ServiceContactWidget1 />
                      </div>
                    </div>
                  )}
                </div>
              </div> */}
          </div>
        </div>
      </section>
      {/* </StickyContainer> */}
    </>
  );
}
