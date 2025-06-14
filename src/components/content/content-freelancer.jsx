import React from 'react';

import FreelancerSchema from '@/utils/Seo/Schema/FreelancerSchema';

import FeaturedServices from '../parts/freelancer-featured-services';
import FeaturesFreelancer from '../parts/freelancer-features';
import Industries from '../parts/freelancer-industries';
import InfoFreelancer from '../parts/freelancer-info';
import MetaFreelancer from '../parts/freelancer-meta';
import Metrics from '../parts/freelancer-metrics';
import Skills from '../parts/freelancer-skills';
import TermsFreelancer from '../parts/freelancer-terms';
import Reviews from '../parts/reviews';
import ServiceAudioFiles from '../parts/service-audio-files';
import FeaturedFile from '../parts/service-featured-file';
import StickySidebar from '../sidebar/sidebar-sticky';
import Protected from '../wrapper/protected';
import { DescriptionBlock } from '../parts';
import {
  AddModelReviewForm_D,
  FreelancerReportForm_D,
  ServiceFeaturedFiles_D,
  StartChatModal_D,
} from '../dynamic';

export default function FreelancerProfile({
  fid,
  freelancerDisplayName,
  freelancerUsername,
  freelancerEmail,
  freelancerId,
  freelancer,
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
    viber,
    whatsapp,
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

  // Filter out audio files
  const audioFiles = portfolio?.data
    ?.filter((file) => file.attributes.mime?.startsWith('audio/'))
    .map((file) => file.attributes); // Map to attributes for the component

  return (
    <section className='pt10 pb90 pb30-md bg-white'>
      <FreelancerSchema
        username={username}
        displayName={displayName}
        location={coverage?.county?.data?.attributes?.name}
        rating={rating}
        reviews_total={reviews_total}
        reviews={reviews}
        profileImage={image.data?.attributes?.formats?.thumbnail?.url}
      />
      <div className='container'>
        <div className='row wow fadeInUp'>
          <div className='col-lg-8'>
            <MetaFreelancer
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
            <div className='service-about'>
              <DescriptionBlock heading='Σχετικά' text={description} />
              <FeaturesFreelancer
                minBudget={minBudget?.data}
                size={size?.data?.attributes}
                contactTypes={contactTypes?.data}
                payment_methods={payment_methods?.data}
                settlement_methods={settlement_methods?.data}
              />
              <Industries industries={industries?.data} />
              <div className='d-lg-none'>
                <div className='blog-sidebar column'>
                  <InfoFreelancer
                    rate={rate}
                    coverage={coverage}
                    commencement={commencement}
                    website={website}
                    phone={visibility?.phone && phone}
                    viber={viber}
                    whatsapp={whatsapp}
                    email={visibility?.email && email}
                    freelancerId={freelancerId}
                    freelancerName={displayName}
                    isOwner={isOwner}
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
              {(audioFiles?.length > 0 || portfolio?.data?.length > 0) && (
                <h4>Δείγμα Εργασιών</h4>
              )}
              <ServiceAudioFiles audioFiles={audioFiles} hideContainer />
              {portfolio.data.length > 0 && (
                <>
                  {portfolio.data.length > 1 ? (
                    <ServiceFeaturedFiles_D files={portfolio.data} border />
                  ) : (
                    <FeaturedFile
                      file={portfolio?.data[0]}
                      formats={portfolio?.data[0]?.attributes?.formats}
                    />
                  )}
                </>
              )}
              <TermsFreelancer heading='Όροι Συνεργασίας' text={terms} border />
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
                  type === 'company'
                    ? 'Κάνε σύνδεση για να αξιολογήσεις την επιχείρηση.'
                    : 'Κάνε σύνδεση για να αξιολογήσεις τον επαγγελματία.'
                }
              >
                {!isOwner && (
                  <>
                    {services.length > 0 ? (
                      <AddModelReviewForm_D
                        type='freelancer'
                        freelancerId={freelancerId}
                      />
                    ) : (
                      <div></div>
                    )}
                  </>
                )}
              </Protected>
              {!isOwner && (
                <div className='text-start mt50'>
                  <button
                    className='ud-btn btn-thm-border mb25 me-4'
                    data-bs-toggle='modal'
                    data-bs-target='#freelancerReportModal'
                  >
                    Αναφορά Προφίλ
                  </button>
                </div>
              )}
            </div>
          </div>
          <StickySidebar>
            <InfoFreelancer
              rate={rate}
              coverage={coverage}
              commencement={commencement}
              website={website}
              phone={visibility?.phone && phone}
              email={visibility?.email && email}
              viber={viber}
              whatsapp={whatsapp}
              fid={fid}
              freelancerId={freelancerId}
              freelancerName={displayName}
              isOwner={isOwner}
            />
            <Skills
              skills={skills?.data}
              specialization={specialization?.data}
            />
          </StickySidebar>
        </div>
      </div>
      <StartChatModal_D
        fid={fid}
        freelancerId={freelancerId}
        displayName={displayName}
      />
      <FreelancerReportForm_D
        reporter={{
          id: fid,
          email: freelancerEmail,
          displayName: freelancerDisplayName,
          username: freelancerUsername,
        }}
        reported={{
          id: freelancerId,
          email: email,
          displayName: displayName,
          username: username,
        }}
      />
    </section>
  );
}
