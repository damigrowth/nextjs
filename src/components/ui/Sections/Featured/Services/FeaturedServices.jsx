import React from "react";
import { Suspense } from "react";
import FeaturedServiceCard from "@/components/ui/Cards/FeaturedServiceCard";
import FeaturedServiceSliderCard from "@/components/ui/Cards/FeaturedServiceSliderCard";
import ServicesClientWrapper from "./ServicesClientWrapper";

// This remains a Server Component that can be async
export default async function FeaturedServices({ categories, services, fid }) {
  // Filter out invalid services up front
  const validServices = services.filter(
    (service) =>
      service?.attributes?.freelancer?.data?.attributes &&
      service.attributes.media?.data?.length > 0
  );

  // Pre-render all service cards on the server
  const renderedServiceCards = await Promise.all(
    validServices.map(async (service) => {
      // Preprocess service data
      const serviceData = { id: service.id, ...service.attributes };
      const categorySlug =
        service.attributes.category?.data?.attributes?.slug || "";

      // Pre-render the appropriate card component based on media length
      const serviceCard =
        service.attributes.media?.data?.length > 1 ? (
          <FeaturedServiceSliderCard service={serviceData} fid={fid} />
        ) : (
          <FeaturedServiceCard service={serviceData} fid={fid} />
        );

      // Return processed data for the client component
      return {
        id: service.id,
        categorySlug,
        renderedCard: (
          <Suspense fallback={<div className="card-skeleton">Loading...</div>}>
            {serviceCard}
          </Suspense>
        ),
      };
    })
  );

  // Prepare and pass category data for filtering
  const categoryData = categories.map((cat) => ({
    slug: cat.attributes.slug,
    label: cat.attributes.label,
  }));

  // Pass the pre-rendered cards and category data to the client wrapper
  return (
    <ServicesClientWrapper
      renderedServiceCards={renderedServiceCards}
      categories={categoryData}
    />
  );
}
