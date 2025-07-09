import React from 'react';

import FreelancerArchiveSchema from '@/utils/Seo/Schema/FreelancerArchiveSchema';
import { getBatchFreelancerSavedStatuses } from '@/utils/savedStatus';

import FreelancerCard from '../../card/freelancer-card';
import { getFreelancerId } from '@/actions/shared/freelancer';
import { getFreelancer } from '@/actions/shared/freelancer';

export default async function FreelancerGrid({
  freelancers: freelancersData,
  taxonomies,
  type,
}) {
  const freelancers = (freelancersData || []).map((freelancer) => ({
    id: freelancer.id,
    ...freelancer.attributes,
  }));

  const fid = await getFreelancerId();

  // Get saved data for performance optimization
  const freelancer = await getFreelancer();
  const savedFreelancers = freelancer?.saved_freelancers?.data || [];

  // Calculate saved statuses for all freelancers at once
  const freelancerIds = freelancers.map((f) => f.id);
  const savedFreelancerStatuses = getBatchFreelancerSavedStatuses(
    freelancerIds,
    savedFreelancers,
  );

  return (
    <div className='row'>
      <FreelancerArchiveSchema
        type={type}
        entities={freelancers}
        taxonomies={taxonomies}
      />
      {freelancers.length > 0 ? (
        freelancers.map((freelancer) => (
          <div key={freelancer.id} className='col-sm-6 col-xl-4'>
            <FreelancerCard
              freelancer={freelancer}
              fid={fid}
              linkedName
              savedStatus={savedFreelancerStatuses[freelancer.id]}
            />
          </div>
        ))
      ) : (
        <div>
          Δεν βρέθηκαν {type === 'company' ? 'επιχειρήσεις' : 'επαγγελματίες'}
        </div>
      )}
    </div>
  );
}
