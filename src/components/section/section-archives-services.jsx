import React from 'react';

import ServiceArchiveSchema from '@/utils/Seo/Schema/ServiceArchiveSchema';
import { getBatchServiceSavedStatuses } from '@/utils/savedStatus';

import ServiceCard from '../card/card-service';

export default function ServiceGrid({ services, taxonomies, fid, savedServices = [] }) {
  // Calculate saved statuses for all services at once
  const serviceIds = services?.map(service => service.id) || [];
  const savedServiceStatuses = getBatchServiceSavedStatuses(serviceIds, savedServices);

  return (
    <div className='row'>
      <div className='col-lg-12'>
        <ServiceArchiveSchema entities={services} taxonomies={taxonomies} />
        {services && services.length > 0 ? (
          services.map((service, i) => (
            <div key={i}>
              <ServiceCard 
                service={service} 
                fid={fid} 
                savedStatus={savedServiceStatuses[service.id]}
              />
            </div>
          ))
        ) : (
          <div>Δεν βρέθηκαν υπηρεσίες</div>
        )}
      </div>
    </div>
  );
}
