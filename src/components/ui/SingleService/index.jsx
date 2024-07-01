import AddModelReviewForm from "@/components/ui/forms/AddModelReviewForm";
import Description from "./Description";
import Packages from "./Packages";
import Faq from "./Faq";
import Addons from "./Addons";
import { RATING_SERVICES_COUNT } from "@/lib/queries";
import Info from "./Info";
import Meta from "./Meta";
import SkeletonRect from "@/components/ui/loading/PartialSkeletons";
import OrderPackages from "./OrderPackages";
import OrderFixed from "./OrderFixed";
import ContactDetails from "./ContactDetails";
import StickySidebar from "@/components/ui/sticky/StickySidebar";
import Gallery from "../Gallery/Gallery";
import { getUserId } from "@/lib/user/user";
import { getData } from "@/lib/client/operations";
import { COUNT_SERVICES_BY_RATING } from "@/lib/graphql/queries";
import Reviews from "../Reviews/Reviews";
import Terms from "./Terms";
import Buy from "./Buy";

export default async function SingleService({
  serviceId,
  service,
  reviews,
  ratings,
  reviewsPage,
  reviewsMeta,
  allReviewsRatings,
  totalFreelancerReviews,
}) {
  const {
    title,
    views,
    area,
    category,
    time,
    media,
    description,
    tags,
    fixed,
    price,
    addons,
    packages,
    faq,
    rating,
    rating_global,
    freelancer: freelancerUser,
  } = service;

  const userId = freelancerUser.data.attributes.user.data.id;
  const user = freelancerUser.data.attributes.user.data.attributes;

  const freelancerId = freelancerUser.data.id;
  const freelancer = freelancerUser.data.attributes;

  return (
    <section className="pt10 pb90 pb30-md">
      <div className="container">
        <div className="row wrap service-wrapper">
          <div className="col-lg-8">
            <div className="column">
              <div className="row  px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                <Meta
                  title={title}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  displayName={user.displayName}
                  username={freelancer.username}
                  image={user.image.data?.attributes?.formats?.thumbnail?.url}
                  views={views?.data?.length}
                  verified={user.verification.data}
                  topLevel={freelancer?.topLevel}
                  rating={rating}
                  totalReviews={reviewsMeta?.total}
                />

                <Info
                  area={area.data?.attributes?.name}
                  category={category.data?.attributes?.label}
                  time={time}
                />
              </div>
              <div className="service-about">
                <Description
                  description={description}
                  tags={tags.data}
                  contactTypes={freelancer.contactTypes}
                  payment_methods={freelancer.payment_methods}
                  settlement_methods={freelancer.settlement_methods}
                />
                <Gallery images={media.data} />
                {fixed ? null : <Packages packages={packages} />}
                {addons?.length > 0 && <Addons addons={addons} price={price} />}
                {faq?.length > 0 && <Faq faq={faq} />}
                <Terms heading="Όροι Συνεργασίας" text={freelancer?.terms} />
                {/* <hr className="opacity-100 mb15" /> */}
                <Reviews
                  type="service"
                  modelId={serviceId}
                  reviews={reviews}
                  ratings={ratings}
                  rating={rating}
                  rating_global={rating_global.data}
                  reviewsMeta={reviewsMeta}
                  reviewsPage={reviewsPage}
                  allReviewsRatings={allReviewsRatings}
                />
                <AddModelReviewForm
                  modelType="service"
                  tenantType="freelancer"
                  modelId={serviceId}
                  tenantId={freelancerId}
                />
              </div>
            </div>
          </div>
          <StickySidebar>
            {fixed ? (
              <OrderFixed
                price={price}
                addons={addons}
                serviceId={serviceId}
                freelancerId={freelancerId}
                userId={userId}
              />
            ) : (
              <OrderPackages
                packages={packages}
                addons={addons}
                serviceId={serviceId}
                freelancerId={freelancerId}
                userId={userId}
              />
            )}
            <ContactDetails
              firstName={user.firstName}
              lastName={user.lastName}
              displayName={user.displayName}
              username={freelancer.username}
              tagline={freelancer.tagline}
              topLevel={freelancer.topLevel}
              base={freelancer.base}
              rate={freelancer.rate}
              image={user.image?.data?.attributes?.formats?.thumbnail?.url}
              rating={rating}
              totalReviews={reviewsMeta?.total}
              socials={freelancer.socials}
              email={user.email}
              phone={user.phone}
              website={freelancer.website}
              type={freelancer.type}
              category={freelancer.category}
              commencement={freelancer.commencement}
            />
          </StickySidebar>
        </div>
      </div>
    </section>
  );
}
