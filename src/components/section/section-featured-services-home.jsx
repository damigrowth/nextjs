'use client';

import React, { useEffect, useState, Suspense, memo } from 'react';
import { useLazyQuery } from '@apollo/client';
import { ServicesClientWrapper } from '../wrapper';
import { useFreelancer } from '@/hooks/useFreelancer';
import { FEATURED_SERVICES } from '@/lib/graphql';
import {
  FeaturedServiceCardClient,
  FeaturedServiceSliderCardClient,
} from '../card';

/**
 * FeaturedServicesHome - Simplified pagination approach:
 * - Initial data from server-side (ISR)
 * - Pure client-side pagination via useLazyQuery (no URL changes)
 * - Freelancer data from context (shared across components)
 */
const FeaturedServicesHome = memo(function FeaturedServicesHome({
  initialServices = [],
  initialPagination = {},
  categories = [],
}) {
  // Get freelancer data from Zustand (via hook for backward compatibility)
  const freelancerData = useFreelancer();

  // Local state for pagination (no URL dependency)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [activeCategory, setActiveCategory] = useState(undefined);

  const [servicesData, setServicesData] = useState({
    services: initialServices,
    pagination: initialPagination,
    isLoading: false,
  });

  // Lazy query for pagination (only triggered when needed)
  const [fetchServices, { loading: servicesLoading }] = useLazyQuery(
    FEATURED_SERVICES,
    {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
      onCompleted: (data) => {
        setServicesData({
          services: data?.services?.data || [],
          pagination: data?.services?.meta?.pagination || {},
          isLoading: false,
        });
      },
      onError: (error) => {
        console.error('❌ Services lazy query error:', error);
        setServicesData((prev) => ({ ...prev, isLoading: false }));
      },
    },
  );

  // Handle pagination and filtering with local state
  useEffect(() => {
    // Check if we need to fetch new data
    const isFirstPage = currentPage === 1;
    const isDefaultPageSize = pageSize === 4;
    const hasNoCategory = !activeCategory;

    // Use initial server data for first page with default params
    if (isFirstPage && isDefaultPageSize && hasNoCategory) {
      setServicesData({
        services: initialServices,
        pagination: initialPagination,
        isLoading: false,
      });
      return;
    }

    // Use lazy query for pagination or filtering

    setServicesData((prev) => ({ ...prev, isLoading: true }));
    fetchServices({
      variables: {
        page: currentPage,
        pageSize: pageSize,
        category: activeCategory,
      },
    });
  }, [
    currentPage,
    pageSize,
    activeCategory,
    fetchServices,
    initialServices,
    initialPagination,
  ]);

  // Pagination callbacks
  const handlePageChange = (newPage, category) => {
    setCurrentPage(newPage);
    if (category !== activeCategory) {
      setActiveCategory(category);
    }
  };

  const handleCategoryChange = (categorySlug) => {
    setCurrentPage(1); // Reset to page 1 when changing category
    setActiveCategory(categorySlug);
  };

  const isLoading =
    servicesLoading || freelancerData.isLoading || servicesData.isLoading;

  const validServices = servicesData.services.filter(
    (service) =>
      service?.attributes?.freelancer?.data?.attributes &&
      service.attributes.media?.data?.length > 0,
  );

  // Pre-render service cards with user data
  const renderedServiceCards = validServices.map((service) => {
    const serviceInfo = { id: service.id, ...service.attributes };

    // Find saved status from freelancer data
    const savedStatus =
      freelancerData.savedServices.find(
        (saved) => saved.id === service.id || saved.id === String(service.id),
      ) || null;

    const serviceCard =
      service.attributes.media?.data?.length > 1 ? (
        <FeaturedServiceSliderCardClient
          service={serviceInfo}
          fid={freelancerData.fid}
          savedStatus={savedStatus}
        />
      ) : (
        <FeaturedServiceCardClient
          service={serviceInfo}
          fid={freelancerData.fid}
          savedStatus={savedStatus}
        />
      );

    return {
      id: service.id,
      renderedCard: (
        <Suspense
          key={service.id}
          fallback={<div className='card-skeleton'>Loading...</div>}
        >
          {serviceCard}
        </Suspense>
      ),
    };
  });

  const categoryData = categories.map((cat) => ({
    slug: cat.attributes?.slug || cat.slug,
    label: cat.attributes?.label || cat.label,
  }));

  return (
    <ServicesClientWrapper
      renderedServiceCards={renderedServiceCards}
      categories={categoryData}
      pagination={servicesData.pagination}
      isLoading={isLoading}
      onPageChange={handlePageChange}
      onCategoryChange={handleCategoryChange}
      currentPage={currentPage}
      activeCategory={activeCategory}
    />
  );
});

export default FeaturedServicesHome;
