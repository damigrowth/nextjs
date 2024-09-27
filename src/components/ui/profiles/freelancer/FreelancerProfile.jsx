import { freelancer1 } from "@/data/product";
import React from "react";
import Meta from "./Meta";
import Metrics from "./Metrics";
import Description from "./Terms";
import Education from "./Education";
import Experience from "./Experience";
import Certificates from "./Certificates";
import Featured from "./Featured";
import StickySidebar from "@/components/ui/sticky/StickySidebar";
import Info from "./Info";
import Skills from "./Skills";
import Features from "./Features";
import Industries from "./Industries";
import FeaturedServices from "./FeaturedServices";
import Gallery from "@/components/ui/Gallery/Gallery";
import Reviews from "../../Reviews/Reviews";
import AddModelReviewForm from "../../forms/AddModelReviewForm";
import Terms from "./Terms";
import FreelancerSchema from "@/utils/Seo/Schema/FreelancerSchema";
import Protected from "@/components/auth/Protected";

export default function FreelancerProfile({
  freelancer,
  uid,
  services,
  servicesPage,
  servicesMeta,
  reviews,
  reviewsMeta,
  reviewsPage,
}) {
  const {
    user: userData,
    tagline,
    base,
    coverage,
    socials,
    image,
    description,
    rate,
    commencement,
    yearsOfExperience,
    type,
    website,
    minBudgets,
    size,
    contactTypes,
    payment_methods,
    settlement_methods,
    skills,
    specialisations,
    industries,
    topLevel,
    portfolio,
    terms,
    rating,
    rating_global,
    reviews_total,
    rating_stars_1,
    rating_stars_2,
    rating_stars_3,
    rating_stars_4,
    rating_stars_5,
  } = freelancer;

  const user = userData?.data?.attributes;

  const ratingStars = [
    rating_stars_1,
    rating_stars_2,
    rating_stars_3,
    rating_stars_4,
    rating_stars_5,
  ];

  return (
    <section className="pt10 pb90 pb30-md">
      <FreelancerSchema
        displayName={user?.displayName}
        location={base?.county?.data?.attributes?.name}
        rating={rating}
        reviews_total={reviews_total}
        reviews={reviews}
        profileImage={user.image.data?.attributes?.formats?.thumbnail?.url}
      />
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-8">
            <Meta
              topLevel={topLevel}
              firstName={user?.firstName}
              lastName={user?.lastName}
              displayName={user?.displayName}
              tagline={tagline}
              address={user?.address}
              socials={socials}
              image={user.image.data?.attributes?.formats?.thumbnail?.url}
              rating={rating}
              totalReviews={reviews_total}
              verified={user?.verified}
              visibility={user?.visibility}
            />
            <Metrics
              type={type?.data?.attributes}
              servicesTotal={servicesMeta?.total}
              commencement={commencement}
              yearsOfExperience={yearsOfExperience}
            />
            <div className="service-about">
              <Description heading="Περιγραφή" text={description} />
              <Industries industries={industries?.data} />
              <Features
                minBudgets={minBudgets?.data}
                size={size?.data?.attributes}
                contactTypes={contactTypes?.data}
                payment_methods={payment_methods?.data}
                settlement_methods={settlement_methods?.data}
              />
              <FeaturedServices
                uid={uid}
                services={services}
                meta={servicesMeta}
                servicesPage={servicesPage}
              />
              {portfolio?.data?.length > 0 && (
                <Gallery images={portfolio?.data} title="Portfolio" border />
              )}
              <Terms heading="Όροι Συνεργασίας" text={terms} border />
              <Reviews
                reviews={reviews}
                rating={rating}
                reviews_total={reviews_total}
                rating_global={rating_global.data}
                reviewsMeta={reviewsMeta}
                reviewsPage={reviewsPage}
                ratingStars={ratingStars}
                showReviewsModel
              />
              <Protected
                message={
                  type === "company"
                    ? "Κάνε σύνδεση για να αξιολογήσεις την επιχείρηση."
                    : "Κάνε σύνδεση για να αξιολογήσεις τον επαγγελματία."
                }
              >
                <AddModelReviewForm
                  modelType="service"
                  tenantType="freelancer"
                  // modelId={serviceId} // TODO: Fetch all orders and get the services ids in an input
                  tenantId={uid}
                />
              </Protected>
            </div>
          </div>
          <StickySidebar>
            <Info
              rate={rate}
              base={base?.area?.data?.attributes?.name}
              coverage={coverage}
              commencement={commencement}
              website={website}
              phone={user.phone}
              email={user.email}
            />
            <Skills
              skills={skills?.data}
              specialisations={specialisations?.data}
            />
          </StickySidebar>
        </div>
      </div>
    </section>
  );
}
