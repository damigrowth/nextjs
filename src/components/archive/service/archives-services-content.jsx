import React from 'react';

import { getFreelancerId } from '@/actions';
import { Topbar } from '@/components/bar';
import { Pagination } from '@/components/pagination';
import { ServiceGrid } from '@/components/section';
import { getData } from '@/lib/client/operations';
import { SERVICES_ARCHIVE, SERVICES_ARCHIVE_WITH_TAGS } from '@/lib/graphql';

import { serviceSortOptions } from '../../../constants/options';

export default async function ArchivesServicesContent({
  paramsFilters,
  taxonomies,
}) {
  // Επιλογή του κατάλληλου query ανάλογα με το αν έχουν επιλεγεί tags
  const query =
    paramsFilters.tags && paramsFilters.tags.length > 0
      ? SERVICES_ARCHIVE_WITH_TAGS
      : SERVICES_ARCHIVE;

  const { services } = await getData(query, paramsFilters);

  const fid = await getFreelancerId();

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
      />
      <div className='row mt30'>
        <Pagination meta={services?.meta?.pagination} plural='υπηρεσίες' />
      </div>
    </>
  );
}
