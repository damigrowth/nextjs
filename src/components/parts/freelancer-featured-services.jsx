import React from 'react';

import { getImage } from '@/utils/image';

import LoadMoreBtn from '../button/button-load-more';
import ServiceCard from '../card/card-service-freelancer';

export default async function FeaturedServices({
  services,
  meta,
  servicesPage,
}) {
  if (services.length === 0) {
    return null;
  }

  return (
    <>
      <hr className='opacity-100 mb60 mt60' />
      <h4 className='mb30'>
        {meta.total > 1
          ? `${meta.total} Υπηρεσίες`
          : `${meta.total} Υπηρεσία`}{' '}
      </h4>
      <div className='row mb35'>
        {services.map((service, i) => {
          // Use the new utility to get subdivision image with fallback
          const subdivisionImageUrl = getImage(
            service.attributes.subdivision?.data?.attributes?.image,
            { size: 'medium' }
          );

          const fallbackImage = subdivisionImageUrl;

          return (
            <div className='col-sm-6 col-xl-4' key={i}>
              <ServiceCard
                media={service.attributes.media.data}
                price={service.attributes.price}
                category={service.attributes.category.data.attributes.label}
                title={service.attributes.title}
                rating={service.attributes.rating}
                reviews_total={service.attributes.reviews_total}
                slug={service.attributes.slug}
                fallback={fallbackImage}
              />
            </div>
          );
        })}
      </div>
      <LoadMoreBtn
        name='Υπηρεσίες'
        paramsName='services'
        total={meta.total}
        count={services.length}
        paramsPage={servicesPage}
      />
      <hr className='opacity-100 mb60 mt60' />
    </>
  );
}
