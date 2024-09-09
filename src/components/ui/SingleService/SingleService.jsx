import AddModelReviewForm from "@/components/ui/forms/AddModelReviewForm";
import Description from "./Description";
import Packages from "./Packages";
import Faq from "./Faq";
import Addons from "./Addons";
import Info from "./Info";
import Meta from "./Meta";
import OrderPackages from "./OrderPackages";
import OrderFixed from "./OrderFixed";
import ContactDetails from "./ContactDetails";
import StickySidebar from "@/components/ui/sticky/StickySidebar";
import Gallery from "../Gallery/Gallery";
import Reviews from "../Reviews/Reviews";
import Terms from "./Terms";
import FeaturedImage from "./FeaturedImage";
import ServiceSchema from "@/utils/Seo/Schema/ServiceSchema";
import Protected from "@/components/auth/Protected";

export default async function SingleService({
  serviceId,
  service,
  reviews,
  reviewsPage,
  reviewsMeta,
}) {
  const {
    title,
    views,
    area,
    category,
    subcategory,
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
    reviews_total,
    rating_global,
    rating_stars_1,
    rating_stars_2,
    rating_stars_3,
    rating_stars_4,
    rating_stars_5,
    freelancer: freelancerUser,
  } = service;

  const userId = freelancerUser.data.attributes.user.data.id;
  const user = freelancerUser.data.attributes.user.data.attributes;

  const isVerified =
    user?.verification?.data?.attributes?.status?.data?.attributes?.type ===
    "Completed";

  const freelancerId = freelancerUser.data.id;
  const freelancer = freelancerUser.data.attributes;

  const ratingStars = [
    rating_stars_1,
    rating_stars_2,
    rating_stars_3,
    rating_stars_4,
    rating_stars_5,
  ];

  return (
    <section className="pt10 pb90 pb30-md bg-orange">
      <ServiceSchema
        title={title}
        displayName={user.displayName}
        price={price}
        rating={rating}
        reviews_total={reviews_total}
        reviews={reviews}
        faq={faq}
      />
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
                  verified={isVerified}
                  topLevel={freelancer?.topLevel}
                  rating={freelancer.rating}
                  totalReviews={freelancer.reviews_total}
                />

                <Info
                  area={area.data?.attributes?.name}
                  category={category.data?.attributes}
                  subcategory={subcategory.data?.attributes}
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
                {media.data.length > 1 ? (
                  <Gallery images={media.data} />
                ) : (
                  <FeaturedImage formats={media.data[0].attributes.formats} />
                )}
                {fixed ? null : <Packages packages={packages} />}
                {addons?.length > 0 && <Addons addons={addons} price={price} />}
                {faq?.length > 0 && <Faq faq={faq} />}
                <Terms heading="Όροι Συνεργασίας" text={freelancer?.terms} />
                {/* <hr className="opacity-100 mb15" /> */}
                <Reviews
                  reviews={reviews}
                  rating={rating}
                  reviews_total={reviews_total}
                  rating_global={rating_global.data}
                  reviewsMeta={reviewsMeta}
                  reviewsPage={reviewsPage}
                  ratingStars={ratingStars}
                />
                <Protected message="Κάνε σύνδεση για να αξιολογήσεις την υπηρεσία.">
                  <AddModelReviewForm
                    modelType="service"
                    tenantType="freelancer"
                    modelId={serviceId}
                    tenantId={freelancerId}
                  />
                </Protected>
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
                username={freelancer.username}
              />
            ) : (
              <OrderPackages
                packages={packages}
                addons={addons}
                serviceId={serviceId}
                freelancerId={freelancerId}
                userId={userId}
                username={freelancer.username}
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
              rating={freelancer.rating}
              totalReviews={freelancer.reviews_total}
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
