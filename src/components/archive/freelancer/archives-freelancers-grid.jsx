import React from 'react';

import FreelancerArchiveSchema from '@/utils/Seo/Schema/FreelancerArchiveSchema';

import FreelancerCard from '../../card/freelancer-card';
import { getFreelancerId } from '@/actions/shared/freelancer';

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
            <FreelancerCard freelancer={freelancer} fid={fid} linkedName />
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
