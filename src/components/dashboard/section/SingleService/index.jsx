// import { Sticky, StickyContainer } from "react-sticky";

import AddServiceReviewForm from "@/components/forms/AddServiceReviewForm";
import Gallery from "./Gallery";
import Description from "./Description";
import Packages from "./Packages";
import Faq from "./Faq";
import Addons from "./Addons";
import Reviews from "./Reviews";
import { RATING_SERVICES_COUNT } from "@/lib/queries";
import { getData } from "@/lib/api";
import Info from "./Info";
import Meta from "./Meta";

export default async function SingleService({
  serviceId,
  service,
  reviews,
  ratings,
}) {
  if (!service) {
    return (
      <div>
        <p>Παρακαλώ περιμένετε...</p>
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
                  <Meta
                    title={service.title}
                    displayName={service.freelancer.data.attributes.displayName}
                    rating={service.rating}
                    ratingServicesCount={ratingServicesCount}
                  />
                  <Info
                    area={service.area.data.attributes.name}
                    time={service.time}
                  />
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
