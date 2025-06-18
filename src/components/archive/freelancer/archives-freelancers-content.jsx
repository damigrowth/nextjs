import React from 'react';

import { getPublicData } from '@/lib/client/operations';
import {
  FREELANCERS_ARCHIVE,
  FREELANCERS_ARCHIVE_WITH_SKILLS,
} from '@/lib/graphql';

import { freelancerSortOptions } from '../../../constants/options';
import Topbar from '../../bar/topbar';
import Pagination from '../../pagination/pagination';
import FreelancerGrid from './archives-freelancers-grid';

export default async function Content({ paramsFilters, taxonomies }) {
  // Επιλογή του κατάλληλου query ανάλογα με το αν έχουν επιλεγεί skills
  const query =
    paramsFilters.skills && paramsFilters.skills.length > 0
      ? FREELANCERS_ARCHIVE_WITH_SKILLS
      : FREELANCERS_ARCHIVE;

  const { freelancers } = await getPublicData(query, paramsFilters);

  return (
    <>
      <Topbar
        meta={freelancers?.meta?.pagination}
        single={
          paramsFilters.type === 'company' ? 'επιχείρηση' : 'επαγγελματίας'
        }
        plural={
          paramsFilters.type === 'company' ? 'επιχειρήσεις' : 'επαγγελματίες'
        }
        sortOptions={freelancerSortOptions}
      />
      <FreelancerGrid
        freelancers={freelancers?.data}
        taxonomies={taxonomies}
        type={paramsFilters.type}
      />
      <div className='row mt30'>
        <Pagination
          meta={freelancers?.meta?.pagination}
          plural={
            paramsFilters.type === 'company' ? 'επιχειρήσεις' : 'επαγγελματίες'
          }
        />
      </div>
    </>
  );
}
