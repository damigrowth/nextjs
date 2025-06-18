import React, { Suspense } from 'react';
import LinkNP from '@/components/link';
import { FreelancerCard } from '@/components/card';
import { FreelancersClientWrapper } from '../wrapper';
import { ArrowRightLong } from '@/components/icon/fa';
import { getBatchFreelancerSavedStatuses } from '@/utils/savedStatus';

/**
 * @typedef {object} FeaturedFreelancersHomeProps
 * @property {Array<object>} freelancers - List of freelancer data.
 * @property {object} pagination - Pagination information.
 * @property {string} fid - Freelancer ID.
 * @property {Array<object>} savedFreelancers - User's saved freelancers data.
 */

/**
 * FeaturedFreelancersHome component displays a list of featured freelancers.
 * This is a Server Component that pre-renders freelancer cards and passes them to a client wrapper.
 * @param {FeaturedFreelancersHomeProps} props - The component props.
 * @returns {Promise<JSX.Element>} A promise that resolves to the JSX element for the featured freelancers section.
 */
export default async function FeaturedFreelancersHome({
  freelancers: freelancersData,
  pagination,
  fid,
  savedFreelancers = [], // User's saved freelancers data
}) {
  const validFreelancers = freelancersData.filter(
    (freelancer) => freelancer?.attributes?.image?.data !== null,
  );

  // Use saved freelancers data to create saved statuses lookup
  const freelancerIds = validFreelancers.map((f) => f.id);
  const savedStatuses = getBatchFreelancerSavedStatuses(
    freelancerIds,
    savedFreelancers,
  );

  const renderedFreelancerCards = await Promise.all(
    validFreelancers.map(async (freelancer) => {
      const freelancerData = { id: freelancer.id, ...freelancer.attributes };

      // Get saved status from batch-fetched data
      const savedStatus = savedStatuses[freelancer.id] || null;

      const freelancerCard = (
        <FreelancerCard
          freelancer={freelancerData}
          fid={fid}
          linkedName
          savedStatus={savedStatus}
        />
      );

      return {
        id: freelancer.id,
        renderedCard: (
          <Suspense fallback={<div className='card-skeleton'>Loading...</div>}>
            {freelancerCard}
          </Suspense>
        ),
      };
    }),
  );

  return (
    <section className='bgc-dark pb90 pb30-md'>
      <div className='container'>
        <div className='row align-items-center wow fadeInUp'>
          <div className='col-lg-9'>
            <div className='main-title'>
              <h2 className='title' style={{ color: '#5bbb7b' }}>
                Πιο Δημοφιλείς Επαγγελματίες
              </h2>
              <p className='paragraph text-white'>
                Βρες τους καλύτερους επαγγελματίες που υπάρχουν στην πλατφόρμα
                μας τώρα.
              </p>
            </div>
          </div>
          <div className='col-lg-3'>
            <div className='text-start text-lg-end mb-4 mb-lg-2'>
              <LinkNP className='ud-btn2 text-white' href='/pros'>
                Όλοι οι Επαγγελματίες
                <ArrowRightLong />
              </LinkNP>
            </div>
          </div>
        </div>
        <div className='row wow fadeInUp'>
          <div className='col-lg-12'>
            <FreelancersClientWrapper
              renderedFreelancerCards={renderedFreelancerCards}
              pagination={pagination}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
