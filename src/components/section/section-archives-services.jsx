import React from 'react';

import ServiceArchiveSchema from '@/utils/Seo/Schema/ServiceArchiveSchema';

import ServiceCard from '../card/card-service';

export default function ServiceGrid({ services, taxonomies, fid }) {
  return (
    <div className='row'>
      <div className='col-lg-12'>
        <ServiceArchiveSchema entities={services} taxonomies={taxonomies} />
        {services.length > 0 ? (
          services.map((service, i) => (
            <div key={i}>
              <ServiceCard service={service} fid={fid} />
            </div>
          ))
        ) : (
          <div>Δεν βρέθηκαν υπηρεσίες</div>
        )}
      </div>
    </div>
  );
}
