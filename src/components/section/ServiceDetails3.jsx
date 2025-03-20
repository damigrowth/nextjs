// import { Sticky, StickyContainer } from "react-sticky";

import { RATING_SERVICES_COUNT } from "@/lib/queries";
import ServiceDetailComment1 from "../element/ServiceDetailComment1";
import ServiceDetailExtra1 from "../element/ServiceDetailExtra1";
import ServiceDetailFaq1 from "../element/ServiceDetailFaq1";
// import ServiceDetailReviewInfo1 from "../element/ServiceDetailReviewInfo1";
import ServiceDetailSlider2 from "../element/ServiceDetailSlider2";
import { getData } from "@/lib/api";
import AddServiceReviewForm from "../ui/forms/AddModelReviewForm";
import Packages from "../ui/SingleService/Packages";
import Addons from "../ui/SingleService/Addons";
import Gallery from "../ui/SingleService/FeaturedFiles";
import Description from "../ui/SingleService/Description";
import Faq from "../ui/SingleService/Faq";
import Reviews from "../ui/SingleService/Reviews";

export default async function ServiceDetail3({
  serviceId,
  service,
  reviews,
  ratings,
}) {
  if (!service) {
    return (
      <div>
        <p>Περιμένετε...</p>
      </div>
    );
  }

  // GET SERVICES COUNT OF SPECIFIC RATING
  let ratingServicesCount = undefined;

  if (service.rating_global.data && service.rating_global.data.id) {
    const ratingServicesCountData = await getData(
      RATING_SERVICES_COUNT(service.rating_global.data.id)
    );

    ratingServicesCount =
      ratingServicesCountData?.data?.attributes?.services?.data?.length;
  }

  // console.log("SERVICE-DETAIL=>>", reviews);

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
                          <h5 className="title">Χρόνος Παράδοσης</h5>
                          <p className="mb-0 text">{service.time} Μέρες</p>
                        </div>
                      </div>
                    </div>
                    {/* <div className="col-sm-6 col-md-4">
                      <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                        <div className="icon flex-shrink-0">
                          <span className="flaticon-goal" />
                        </div>
                        <div className="details">
                          <h5 className="title">English Level</h5>
                          <p className="mb-0 text">Professional</p>
                        </div>
                      </div>
                    </div> */}
                    <div className="col-sm-6 col-md-4">
                      <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                        <div className="icon flex-shrink-0">
                          <span className="flaticon-tracking" />
                        </div>
                        <div className="details">
                          <h5 className="title">Περιοχή</h5>
                          <p className="mb-0 text">
                            {service.area.data.attributes.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Gallery />
                <div className="service-about">
                  <Description description={service.description} />
                  {service.fixed ? null : <Packages service={service} />}
                  {service.faq.length > 0 && <Faq faq={service.faq} />}
                  {service.addons.length > 0 && (
                    <Addons addons={service.addons} />
                  )}
                  {/* <hr className="opacity-100 mb15" /> */}

                  {reviews?.length > 0 && (
                    <Reviews
                      reviews={reviews}
                      ratings={ratings}
                      serviceRating={service.rating}
                      serviceRatingGlobal={service.rating_global.data}
                      ratingServicesCount={ratingServicesCount}
                    />
                  )}
                  <AddServiceReviewForm serviceId={serviceId} />
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
