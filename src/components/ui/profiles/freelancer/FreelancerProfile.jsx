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
import Gallery from "@/components/ui/SingleService/FeaturedFiles";
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
    coverage,
    socials,
    image,
    description,
    rate,
    subcategory,
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
        location={coverage?.county?.data?.attributes?.name}
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
              socials={socials}
              image={user.image.data?.attributes?.formats?.thumbnail?.url}
              rating={rating}
              totalReviews={reviews_total}
              verified={user?.verified}
              coverage={coverage}
              visibility={user?.visibility}
            />
            <Metrics
              subcategory={subcategory?.data?.attributes?.label}
              servicesTotal={servicesMeta?.total}
              commencement={commencement}
              yearsOfExperience={yearsOfExperience}
            />
            <div className="service-about">
              <Description heading="Περιγραφή" text={description} />
              <Features
                minBudgets={minBudgets?.data}
                size={size?.data?.attributes}
                contactTypes={contactTypes?.data}
                payment_methods={payment_methods?.data}
                settlement_methods={settlement_methods?.data}
              />
              <Industries industries={industries?.data} />
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
              coverage={coverage}
              commencement={commencement}
              website={website}
              phone={user.phone}
              email={user.email}
              visibility={user?.visibility}
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
