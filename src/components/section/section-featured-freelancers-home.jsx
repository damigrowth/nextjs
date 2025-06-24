'use client';

import React, { useEffect, useState, Suspense, memo } from 'react';
import { useLazyQuery } from '@apollo/client';
import LinkNP from '@/components/link';
import FreelancerCardClient from '../card/freelancer-card-client';
import { FreelancersClientWrapper } from '../wrapper';
import { ArrowRightLong } from '@/components/icon/fa';
import { useFreelancer } from '@/hooks/useFreelancer';
import { FEATURED_FREELANCERS } from '@/lib/graphql';

/**
 * FeaturedFreelancersHome - Simplified pagination approach:
 * - Initial data from server-side (ISR)
 * - Pure client-side pagination via useLazyQuery (no URL changes)
 * - Freelancer data from context (shared across components)
 */
const FeaturedFreelancersHome = memo(function FeaturedFreelancersHome({
  initialFreelancers = [],
  initialPagination = {},
}) {
  const freelancerData = useFreelancer();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  const [freelancersData, setFreelancersData] = useState({
    freelancers: initialFreelancers,
    pagination: initialPagination,
    isLoading: false,
  });

  const [fetchFreelancers, { loading: freelancersLoading }] = useLazyQuery(
    FEATURED_FREELANCERS,
    {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
      onCompleted: (data) => {
        setFreelancersData({
          freelancers: data?.freelancers?.data || [],
          pagination: data?.freelancers?.meta?.pagination || {},
          isLoading: false,
        });
      },
      onError: (error) => {
        console.error('❌ Freelancers lazy query error:', error);
        setFreelancersData((prev) => ({ ...prev, isLoading: false }));
      },
    },
  );

  useEffect(() => {
    const isFirstPage = currentPage === 1;
    const isDefaultPageSize = pageSize === 4;

    if (isFirstPage && isDefaultPageSize) {
      console.log('👨‍💼 Using initial server data for freelancers');
      setFreelancersData({
        freelancers: initialFreelancers,
        pagination: initialPagination,
        isLoading: false,
      });
      return;
    }

    setFreelancersData((prev) => ({ ...prev, isLoading: true }));
    fetchFreelancers({
      variables: {
        page: currentPage,
        pageSize: pageSize,
      },
    });
  }, [
    currentPage,
    pageSize,
    fetchFreelancers,
    initialFreelancers,
    initialPagination,
  ]);

  // Pagination callback
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const isLoading =
    freelancersLoading || freelancerData.isLoading || freelancersData.isLoading;

  const validFreelancers = freelancersData.freelancers.filter(
    (freelancer) => freelancer?.attributes?.image?.data !== null,
  );

  // Pre-render freelancer cards with user data
  const renderedFreelancerCards = validFreelancers.map((freelancer) => {
    const freelancerInfo = { id: freelancer.id, ...freelancer.attributes };

    // Find saved status from freelancer data
    const savedStatus =
      freelancerData.savedFreelancers.find(
        (saved) =>
          saved.id === freelancer.id || saved.id === String(freelancer.id),
      ) || null;

    const freelancerCard = (
      <FreelancerCardClient
        freelancer={freelancerInfo}
        fid={freelancerData.fid}
        linkedName
        savedStatus={savedStatus}
      />
    );

    return {
      id: freelancer.id,
      renderedCard: (
        <Suspense
          key={freelancer.id}
          fallback={<div className='card-skeleton'>Loading...</div>}
        >
          {freelancerCard}
        </Suspense>
      ),
    };
  });

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
              pagination={freelancersData.pagination}
              isLoading={isLoading}
              onPageChange={handlePageChange}
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>
    </section>
  );
});

export default FeaturedFreelancersHome;
