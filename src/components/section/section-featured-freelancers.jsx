import React from 'react';
import LinkNP from '@/components/link';

import { FreelancerCard } from '@/components/card';
import { getBatchFreelancerSavedStatuses } from '@/utils/savedStatus';

import FreelancersListWrapper from '../wrapper/wrapper-featured-freelancers';
import { ArrowLeftLong, ArrowRightLong } from '@/components/icon/fa';

export default function FeaturedFreelancers({
  freelancers: freelancersData,
  fid,
  savedFreelancers = [], // Accept saved freelancers data
}) {
  const freelancers = freelancersData.map((freelancer) => ({
    id: freelancer.id,
    ...freelancer.attributes,
  }));

  // Calculate saved statuses for all freelancers at once
  const freelancerIds = freelancers.map((f) => f.id);
  const savedFreelancerStatuses = getBatchFreelancerSavedStatuses(
    freelancerIds,
    savedFreelancers,
  );

  return (
    <>
      <section className='bgc-dark pb90 pb30-md'>
        <div className='container'>
          <div className='row align-items-center wow fadeInUp'>
            <div className='col-lg-9'>
              <div className='main-title'>
                <h2 className='title ' style={{ color: '#5bbb7b' }}>
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
              <FreelancersListWrapper>
                {freelancers.map((freelancer, index) => (
                  <FreelancerCard
                    key={index}
                    freelancer={freelancer}
                    fid={fid}
                    linkedName
                    savedStatus={savedFreelancerStatuses[freelancer.id]}
                  />
                ))}
              </FreelancersListWrapper>
              <div className='row justify-content-center'>
                <div className='col-auto'>
                  <button className='swiper__btn swiper__btn-2 btn__prev__013'>
                    <ArrowLeftLong />
                  </button>
                </div>
                <div className='col-auto'>
                  <div className='swiper__pagination swiper__pagination-2 swiper__pagination__013'></div>
                </div>
                <div className='col-auto'>
                  <button className='swiper__btn swiper__btn-2 btn__next__013'>
                    <ArrowRightLong />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
