import { redirect } from 'next/navigation';

import { getOtherServicesReviews, getUserId } from '@/actions';
import ServiceSchema from '@/utils/Seo/Schema/ServiceSchema';

import ServiceReportForm from '../form/form-report-service';
import AddModelReviewForm from '../form/form-reviews-create';
import StartChatModal from '../modal/modal-chat-create';
import Reviews from '../parts/reviews';
import Addons from '../parts/service-addons';
import ServiceAudioFiles from '../parts/service-audio-files';
import ContactDetails from '../parts/service-contact-details';
import Description from '../parts/service-description';
import Faq from '../parts/service-faq';
import FeaturedFile from '../parts/service-featured-file';
import FeaturedFiles from '../parts/service-featured-files';
import Info from '../parts/service-info';
import Meta from '../parts/service-meta';
import OrderFixed from '../parts/service-order-fixed';
import OrderPackages from '../parts/service-order-packages';
import Packages from '../parts/service-packages';
import Terms from '../parts/service-terms';
import StickySidebar from '../sidebar/sidebar-sticky';
import Protected from '../wrapper/protected';

export default async function SingleService({
  fid,
  freelancerDisplayName,
  freelancerUsername,
  freelancerEmail,
  serviceId,
  service,
  reviews,
  reviewsPage,
  reviewsMeta,
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

  // Filter out audio files
  const audioFiles = media?.data
    ?.filter((file) => file.attributes.mime?.startsWith('audio/'))
    .map((file) => file.attributes); // Map to attributes for the component

  if (!freelancer?.data?.id) {
    redirect('/not-found');
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
    freelancerId,
  );

  const isOwner = fid === freelancerId;

  return (
    <section className='pt10 pb90 pb30-md bg-orange'>
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
      <div className='container'>
        <div className='row wrap service-wrapper'>
          <div className='col-lg-8'>
            <div className='column'>
              <div className='row px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1'>
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
              <div className='service-about'>
                <Description
                  description={description}
                  tags={tags.data}
                  contactTypes={contactTypes}
                  payment_methods={payment_methods}
                  settlement_methods={settlement_methods}
                />
                <ServiceAudioFiles audioFiles={audioFiles} />
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
                {/* Mobile Sidebar Content */}
                <div className='d-lg-none'>
                  <div className='blog-sidebar column'>
                    {fixed ? (
                      <OrderFixed
                        price={price}
                        addons={addons}
                        username={username}
                        isOwner={isOwner}
                      />
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
                  </div>
                </div>
                {faq?.length > 0 && <Faq faq={faq} />}
                <Terms heading='Όροι Συνεργασίας' text={terms} />
                <Reviews
                  reviews={reviews}
                  rating={freelancerRating}
                  reviews_total={freelancerReviewsTotal}
                  rating_global={rating_global.data}
                  reviewsMeta={reviewsMeta}
                  reviewsPage={reviewsPage}
                  ratingStars={ratingStars}
                  otherServicesReviews={otherServicesReviews}
                  isServicePage={true}
                />
                <Protected message='Κάνε σύνδεση για να αξιολογήσεις την υπηρεσία.'>
                  {fid !== freelancerId && (
                    <AddModelReviewForm
                      type='service'
                      serviceId={serviceId}
                      freelancerId={freelancerId}
                    />
                  )}
                </Protected>
                <div className='text-start mt50'>
                  <button
                    className='ud-btn btn-thm-border mb25 me-4'
                    data-bs-toggle='modal'
                    data-bs-target='#serviceReportModal' // This ID should match the ID in ServiceReportModal.jsx
                  >
                    Αναφορά Υπηρεσίας
                  </button>
                </div>
              </div>
            </div>
          </div>
          <StickySidebar>
            {fixed ? (
              <OrderFixed price={price} addons={addons} />
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
      <StartChatModal
        fid={fid}
        freelancerId={freelancerId}
        displayName={displayName}
        title={
          price === 0 || price === null
            ? `Ενδιαφέρομαι για την υπηρεσία ${title}...`
            : `Ενδιαφέρομαι για την υπηρεσία ${title} (${price}€)...`
        }
      />
      <ServiceReportForm
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
        service={{
          id: serviceId,
          title: title,
        }}
      />
    </section>
  );
}
