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
import FeaturedFiles from "@/components/ui/SingleService/FeaturedFiles";
import Reviews from "../../Reviews/Reviews";
import AddModelReviewForm from "../../forms/AddModelReviewForm";
import Terms from "./Terms";
import FreelancerSchema from "@/utils/Seo/Schema/FreelancerSchema";
import Protected from "@/components/auth/Protected";
import FeaturedFile from "../../SingleService/FeaturedFile";

export default function FreelancerProfile({
  freelancer,
  freelancerId,
  username,
  services,
  servicesPage,
  servicesMeta,
  reviews,
  reviewsMeta,
  reviewsPage,
  isOwner,
}) {
  const {
    firstName,
    lastName,
    displayName,
    verified,
    email,
    phone,
    tagline,
    visibility,
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
    minBudget,
    size,
    contactTypes,
    payment_methods,
    settlement_methods,
    skills,
    specialization,
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
        username={username}
        displayName={displayName}
        location={coverage?.county?.data?.attributes?.name}
        rating={rating}
        reviews_total={reviews_total}
        reviews={reviews}
        profileImage={image.data?.attributes?.formats?.thumbnail?.url}
      />
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-8">
            <Meta
              topLevel={topLevel}
              displayName={displayName}
              firstName={firstName}
              lastName={lastName}
              tagline={tagline}
              socials={socials}
              image={image.data?.attributes?.formats?.thumbnail?.url}
              rating={rating}
              totalReviews={reviews_total}
              verified={verified}
              coverage={coverage}
              visibility={visibility}
            />
            <Metrics
              subcategory={subcategory?.data?.attributes?.label}
              servicesTotal={servicesMeta?.total}
              commencement={commencement}
              yearsOfExperience={yearsOfExperience}
            />
            <div className="service-about">
              <Description heading="Σχετικά" text={description} />
              <Features
                minBudget={minBudget?.data}
                size={size?.data?.attributes}
                contactTypes={contactTypes?.data}
                payment_methods={payment_methods?.data}
                settlement_methods={settlement_methods?.data}
              />
              <Industries industries={industries?.data} />

              {/* Mobile Sidebar Content */}
              <div className="d-lg-none">
                <div className="blog-sidebar column">
                  <Info
                    rate={rate}
                    coverage={coverage}
                    commencement={commencement}
                    website={website}
                    phone={visibility?.phone && phone}
                    email={visibility?.email && email}
                  />
                  <Skills
                    skills={skills?.data}
                    specialization={specialization?.data}
                  />
                </div>
              </div>

              <FeaturedServices
                services={services}
                meta={servicesMeta}
                servicesPage={servicesPage}
              />
              {portfolio.data.length > 0 && (
                <>
                  {portfolio.data.length > 1 ? (
                    <FeaturedFiles
                      files={portfolio.data}
                      title="Δείγμα Εργασιών"
                      border
                    />
                  ) : (
                    <FeaturedFile
                      file={portfolio?.data[0]}
                      formats={portfolio?.data[0]?.attributes?.formats}
                    />
                  )}
                </>
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
                {!isOwner && (
                  <>
                    {services.length > 0 ? (
                      <AddModelReviewForm
                        type="freelancer"
                        freelancerId={freelancerId}
                      />
                    ) : (
                      <div></div>
                    )}
                  </>
                )}
              </Protected>
            </div>
          </div>
          <StickySidebar>
            <Info
              rate={rate}
              coverage={coverage}
              commencement={commencement}
              website={website}
              phone={visibility?.phone && phone}
              email={visibility?.email && email}
            />
            <Skills
              skills={skills?.data}
              specialization={specialization?.data}
            />
          </StickySidebar>
        </div>
      </div>
    </section>
  );
}
