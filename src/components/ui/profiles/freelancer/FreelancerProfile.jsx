import { freelancer1 } from "@/data/product";
import React from "react";
import Meta from "./Meta";
import Metrics from "./Metrics";
import Description from "./Description";
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

export default function FreelancerProfile({
  freelancer,
  uid,
  services,
  servicesPage,
  servicesMeta,
  ratings,
  reviews,
  reviewsMeta,
  reviewsPage,
  allReviewsRatings,
}) {
  const {
    user,
    tagline,
    base,
    coverage,
    socials,
    image,
    description,
    rate,
    commencement,
    type,
    website,
    minBudgets,
    size,
    contactTypes,
    payment_methods,
    settlement_methods,
    skills,
    industries,
    topLevel,
    portfolio,
    terms,
    rating,
    rating_global,
  } = freelancer;

  const freelancerUser = user?.data?.attributes;

  return (
    <section className="pt10 pb90 pb30-md">
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-8">
            <Meta
              topLevel={topLevel}
              firstName={freelancerUser?.firstName}
              lastName={freelancerUser?.lastName}
              displayName={freelancerUser?.displayName}
              tagline={tagline}
              base={base?.county?.data?.attributes?.name}
              socials={socials}
              image={
                freelancerUser.image.data?.attributes?.formats?.thumbnail?.url
              }
              rating={rating}
              totalReviews={reviewsMeta?.total}
            />
            <Metrics
              type={type?.data?.attributes}
              servicesTotal={servicesMeta?.total}
              commencement={commencement}
              verification={
                freelancerUser?.verification?.data?.attributes?.status?.data
                  ?.attributes?.type
              }
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
              <Description heading="Όροι Συνεργασίας" text={terms} border />
              {reviews.length > 0 ? (
                <Reviews
                  type="freelancer"
                  modelId={uid}
                  reviews={reviews}
                  ratings={ratings}
                  rating={rating}
                  rating_global={rating_global.data}
                  reviewsMeta={reviewsMeta}
                  reviewsPage={reviewsPage}
                  allReviewsRatings={allReviewsRatings}
                />
              ) : (
                <h4>Χωρίς Αξιολογήσεις</h4>
              )}
              <AddModelReviewForm type="freelancer" modelId={uid} />
            </div>
          </div>
          <StickySidebar>
            <Info
              rate={rate}
              base={base?.area?.data?.attributes?.name}
              coverage={coverage}
              commencement={commencement}
              website={website}
              phone={freelancerUser.phone}
              email={freelancerUser.email}
            />
            <Skills skills={skills?.data} />
          </StickySidebar>
        </div>
      </div>
    </section>
  );
}
