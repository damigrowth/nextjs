import React, { Suspense } from 'react';

import FeaturedServiceCard from '../card/card-service-featured';
import FeaturedServiceSliderCard from '../card/card-service-featured-slider';
import { ServicesClientWrapper } from '../wrapper';
import { getBatchServiceSavedStatuses } from '@/utils/savedStatus';

/**
 * @typedef {object} FeaturedServicesHomeProps
 * @property {Array<object>} categories - List of service categories.
 * @property {Array<object>} services - List of service data.
 * @property {object} pagination - Pagination information.
 * @property {string} fid - Freelancer ID.
 * @property {Array<object>} savedServices - User's saved services data.
 */

/**
 * FeaturedServicesHome component displays a list of featured services.
 * This is a Server Component that pre-renders service cards and passes them to a client wrapper.
 * @param {FeaturedServicesHomeProps} props - The component props.
 * @returns {Promise<JSX.Element>} A promise that resolves to the JSX element for the featured services section.
 */
export default async function FeaturedServicesHome({
  categories,
  services,
  pagination,
  fid,
  savedServices = [], // User's saved services data
}) {
  const validServices = services.filter(
    (service) =>
      service?.attributes?.freelancer?.data?.attributes &&
      service.attributes.media?.data?.length > 0,
  );

  // Use saved services data to create saved statuses lookup
  const serviceIds = validServices.map(s => s.id);
  const savedStatuses = getBatchServiceSavedStatuses(serviceIds, savedServices);

  const renderedServiceCards = await Promise.all(
    validServices.map(async (service) => {
      const serviceData = { id: service.id, ...service.attributes };
      
      // Get saved status from batch-fetched data
      const savedStatus = savedStatuses[service.id] || null;

      const serviceCard =
        service.attributes.media?.data?.length > 1 ? (
          <FeaturedServiceSliderCard 
            service={serviceData} 
            fid={fid} 
            savedStatus={savedStatus}
          />
        ) : (
          <FeaturedServiceCard 
            service={serviceData} 
            fid={fid} 
            savedStatus={savedStatus}
          />
        );

      return {
        id: service.id,
        renderedCard: (
          <Suspense fallback={<div className='card-skeleton'>Loading...</div>}>
            {serviceCard}
          </Suspense>
        ),
      };
    }),
  );

  const categoryData = categories.map((cat) => ({
    slug: cat.attributes.slug,
    label: cat.attributes.label,
  }));

  return (
    <ServicesClientWrapper
      renderedServiceCards={renderedServiceCards}
      categories={categoryData}
      pagination={pagination}
    />
  );
}
