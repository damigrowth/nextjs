// import { Sticky, StickyWrapper } from "react-sticky";

import AddServiceReviewForm from "@/components/forms/AddServiceReviewForm";
import Description from "./Description";
import Packages from "./Packages";
import Faq from "./Faq";
import Addons from "./Addons";
import Reviews from "./Reviews";
import { RATING_SERVICES_COUNT } from "@/lib/queries";
import { getData } from "@/lib/api";
import Info from "./Info";
import Meta from "./Meta";
import SkeletonRect from "@/components/loading/PartialSkeletons";
import OrderPackages from "./OrderPackages";
import OrderFixed from "./OrderFixed";
import ContactDetails from "./ContactDetails";
import StickySidebar from "@/components/sticky/StickySidebar";
import Gallery from "./Gallery";
import { getUserId } from "@/lib/user/user";

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

  const uid = await getUserId();

  // console.log(uid);

  return (
    <section className="pt10 pb90 pb30-md">
      <div className="container">
        <div className="row wrap">
          <div className="col-lg-8">
            <div className="column">
              <div className="row  px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                <Meta
                  title={service.title}
                  firstName={service.freelancer.data.attributes.firstName}
                  lastName={service.freelancer.data.attributes.lastName}
                  displayName={service.freelancer.data.attributes.displayName}
                  image={
                    service.freelancer.data.attributes?.image?.data?.attributes
                      ?.formats?.thumbnail?.url
                  }
                  rating={service.rating}
                  reviewsCount={reviews.length}
                  views={service.views.data.length}
                />

                <Info
                  area={service.area.data?.attributes?.name}
                  time={service.time}
                />
              </div>
              <Gallery images={service.media.data} />
              <div className="service-about">
                <Description description={service.description} />
                {service.fixed ? null : (
                  <Packages packages={service.packages} />
                )}
                {service.faq.length > 0 && <Faq faq={service.faq} />}
                {service.addons.length > 0 && (
                  <Addons addons={service.addons} />
                )}
                {/* <hr className="opacity-100 mb15" /> */}
                {!reviews ? (
                  <SkeletonRect />
                ) : (
                  <>
                    {reviews.length > 0 && (
                      <Reviews
                        reviews={reviews}
                        ratings={ratings}
                        serviceRating={service.rating}
                        serviceRatingGlobal={service.rating_global.data}
                        ratingServicesCount={ratingServicesCount}
                      />
                    )}
                  </>
                )}

                <AddServiceReviewForm serviceId={serviceId} />
              </div>
            </div>
          </div>
          <StickySidebar>
            {service.fixed ? (
              <OrderFixed
                price={service.price}
                addons={service.addons}
                serviceId={serviceId}
                freelancerId={service.freelancer.data.id}
                userId={uid}
              />
            ) : (
              <OrderPackages
                packages={service.packages}
                addons={service.addons}
                serviceId={serviceId}
                freelancerId={service.freelancer.data.id}
                userId={uid}
              />
            )}
            <ContactDetails
              freelancer={service.freelancer.data.attributes}
              freelancerId={service.freelancer.data.id}
              area={service.area.data?.attributes?.name}
            />
          </StickySidebar>
        </div>
      </div>
    </section>
  );
}
