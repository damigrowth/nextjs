import React, { Suspense } from 'react';
import Link from 'next/link';
import { FreelancerCard } from '@/components/card';
import { FreelancersClientWrapper } from '../wrapper';

/**
 * @typedef {object} FeaturedFreelancersHomeProps
 * @property {Array<object>} freelancers - List of freelancer data.
 * @property {object} pagination - Pagination information.
 * @property {string} fid - Freelancer ID.
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
}) {
  const validFreelancers = freelancersData.filter(
    (freelancer) => freelancer?.attributes?.image?.data !== null,
  );

  const renderedFreelancerCards = await Promise.all(
    validFreelancers.map(async (freelancer) => {
      const freelancerData = { id: freelancer.id, ...freelancer.attributes };

      const freelancerCard = (
        <FreelancerCard freelancer={freelancerData} fid={fid} linkedName />
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
              <Link className='ud-btn2 text-white' href='/pros'>
                Όλοι οι Επαγγελματίες
                <i className='fal fa-arrow-right-long' />
              </Link>
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
