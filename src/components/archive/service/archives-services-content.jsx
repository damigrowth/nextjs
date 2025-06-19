import React from 'react';

import { Topbar } from '@/components/bar';
import { Pagination } from '@/components/pagination';
import { ServiceGrid } from '@/components/section';
import { getPublicData } from '@/lib/client/operations';
import { SERVICES_ARCHIVE, SERVICES_ARCHIVE_WITH_TAGS } from '@/lib/graphql';

import { serviceSortOptions } from '../../../constants/options';
import { getFreelancerId } from '@/actions/shared/freelancer';
import { getFreelancer } from '@/actions/shared/freelancer';

export default async function ArchivesServicesContent({
  paramsFilters,
  taxonomies,
}) {
  // Επιλογή του κατάλληλου query ανάλογα με το αν έχουν επιλεγεί tags
  const query =
    paramsFilters.tags && paramsFilters.tags.length > 0
      ? SERVICES_ARCHIVE_WITH_TAGS
      : SERVICES_ARCHIVE;

  const { services } = await getPublicData(query, paramsFilters);

  const fid = await getFreelancerId();

  // Get saved data for performance optimization
  const freelancer = await getFreelancer();
  const savedServices = freelancer?.saved_services?.data || [];

  return (
    <>
      <Topbar
        meta={services?.meta?.pagination}
        single='υπηρεσία'
        plural='υπηρεσίες'
        sortOptions={serviceSortOptions}
      />
      <ServiceGrid
        services={services?.data}
        taxonomies={taxonomies}
        fid={fid}
        savedServices={savedServices}
      />
      <div className='row mt30'>
        <Pagination meta={services?.meta?.pagination} plural='υπηρεσίες' />
      </div>
    </>
  );
}
