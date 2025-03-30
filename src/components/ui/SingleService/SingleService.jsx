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
import FeaturedFiles from "./FeaturedFiles";
import Reviews from "../Reviews/Reviews";
import Terms from "./Terms";
import FeaturedFile from "./FeaturedFile";
import ServiceSchema from "@/utils/Seo/Schema/ServiceSchema";
import Protected from "@/components/auth/Protected";
import { getUserId } from "@/lib/auth/user";
import { redirect } from "next/navigation";
import { getOtherServicesReviews } from "@/lib/service/service";

export default async function SingleService({
  slug,
  fid,
  serviceId,
  service,
  reviews,
  reviewsPage,
  reviewsMeta,
  isAuthenticated,
}) {
  const {
    title,
    views,
    category,
    subcategory,
    subdivision,
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
    subscription_type,
    reviews_total,
    rating_global,
    rating_stars_1,
    rating_stars_2,
    rating_stars_3,
    rating_stars_4,
    rating_stars_5,
    type,
    freelancer,
  } = service;

  if (!freelancer?.data?.id) {
    redirect("/not-found");
  }

  const userId = await getUserId();

  const freelancerId = freelancer.data.id;
  const freelancerData = freelancer.data.attributes;

  const {
    displayName,
    rating: freelancerRating,
    reviews_total: freelancerReviewsTotal,
    firstName,
    lastName,
    username,
    verified,
    topLevel,
    type: freelancerType,
    subcategory: freelancerSubcategory,
    visibility,
    coverage,
    contactTypes,
    payment_methods,
    settlement_methods,
    terms,
    commencement,
    socials,
    website,
    tagline,
    rate,
    base,
    address,
    email,
    phone,
    image,
  } = freelancerData;

  const ratingStars = [
    rating_stars_1,
    rating_stars_2,
    rating_stars_3,
    rating_stars_4,
    rating_stars_5,
  ];

  // Get reviews from other services
  const otherServicesReviews = await getOtherServicesReviews(
    serviceId,
    freelancerId
  );

  return (
    <section className="pt10 pb90 pb30-md bg-orange">
      <ServiceSchema
        slug={service.slug}
        title={title}
        displayName={displayName}
        price={price}
        rating={rating}
        reviews_total={reviews_total}
        faq={faq}
        image={image?.data?.attributes?.formats?.thumbnail?.url}
      />
      <div className="container">
        <div className="row wrap service-wrapper">
          <div className="col-lg-8">
            <div className="column">
              <div className="row  px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
                <Meta
                  title={title}
                  firstName={firstName}
                  lastName={lastName}
                  displayName={displayName}
                  username={username}
                  image={image.data?.attributes?.formats?.thumbnail?.url}
                  views={views?.data?.length}
                  verified={verified}
                  topLevel={topLevel}
                  rating={freelancerRating}
                  totalReviews={freelancerReviewsTotal}
                />

                <Info
                  // visibility={visibility?.address}
                  coverage={coverage}
                  category={subdivision.data?.attributes}
                  subcategory={subcategory.data?.attributes}
                  time={time}
                  type={{ ...type, subscription_type }}
                />
              </div>
              <div className="service-about">
                <Description
                  description={description}
                  tags={tags.data}
                  contactTypes={contactTypes}
                  payment_methods={payment_methods}
                  settlement_methods={settlement_methods}
                />
                {media.data.length > 0 && (
                  <>
                    {media.data.length > 1 ? (
                      <FeaturedFiles files={media.data} />
                    ) : (
                      <FeaturedFile
                        formats={media?.data[0]?.attributes?.formats}
                        file={media?.data[0]}
                      />
                    )}
                  </>
                )}
                {fixed ? null : <Packages packages={packages} />}
                {addons?.length > 0 && (
                  <Addons addons={addons} price={price} username={username} />
                )}
                {faq?.length > 0 && <Faq faq={faq} />}
                <Terms heading="Όροι Συνεργασίας" text={terms} />
                {/* <hr className="opacity-100 mb15" /> */}
                <Reviews
                  reviews={reviews}
                  rating={rating}
                  reviews_total={reviews_total}
                  rating_global={rating_global.data}
                  reviewsMeta={reviewsMeta}
                  reviewsPage={reviewsPage}
                  ratingStars={ratingStars}
                  otherServicesReviews={otherServicesReviews}
                />
                <Protected message="Κάνε σύνδεση για να αξιολογήσεις την υπηρεσία.">
                  {fid !== freelancerId && (
                    <AddModelReviewForm
                      type="service"
                      serviceId={serviceId}
                      freelancerId={freelancerId}
                    />
                  )}
                </Protected>
              </div>
            </div>
          </div>
          <StickySidebar>
            {fixed ? (
              <OrderFixed price={price} addons={addons} username={username} />
            ) : (
              <OrderPackages
                packages={packages}
                addons={addons}
                serviceId={serviceId}
                freelancerId={freelancerId}
                userId={userId}
                username={username}
              />
            )}
            <ContactDetails
              firstName={firstName}
              lastName={lastName}
              displayName={displayName}
              username={username}
              tagline={tagline}
              topLevel={topLevel}
              verified={verified}
              base={base}
              rate={rate}
              image={image?.data?.attributes?.formats?.thumbnail?.url}
              rating={freelancerRating}
              totalReviews={freelancerReviewsTotal}
              socials={socials}
              email={visibility?.data?.attributes?.email && email}
              phone={visibility?.data?.attributes?.phone && phone}
              website={website}
              type={freelancerType}
              category={freelancerSubcategory}
              commencement={commencement}
            />
          </StickySidebar>
        </div>
      </div>
    </section>
  );
}
