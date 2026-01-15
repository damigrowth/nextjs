import React from 'react';
import { JsonLd } from './json-ld';

interface ServiceSchemaProps {
  slug: string;
  title: string;
  displayName: string;
  price: number;
  // rating: number;
  // reviewCount: number;
  faq: Array<{ question: string; answer: string }>;
  image?: string;
}

/**
 * Product schema for service detail pages
 * Includes pricing and FAQ structured data
 */
export function ServiceSchema({
  slug,
  title,
  displayName,
  price,
  // rating,
  // reviewCount,
  faq,
  image,
}: ServiceSchemaProps) {
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.LIVE_URL || 'https://doulitsa.gr';

  // Map FAQ data to schema.org Question format
  const faqData = faq.map((f, index) => ({
    '@type': 'Question',
    name: `Ερώτηση ${index + 1}`,
    text: f.question,
    acceptedAnswer: {
      '@type': 'Answer',
      name: `Απάντηση ${index + 1}`,
      text: f.answer,
    },
  }));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    image: image,
    brand: {
      '@type': 'Brand',
      name: 'Doulitsa',
    },
    manufacturer: {
      '@type': 'Person',
      name: displayName,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: price,
      url: `${baseUrl}/s/${slug}`,
      availability: 'https://schema.org/InStock',
    },
    // aggregateRating: {
    //   '@type': 'AggregateRating',
    //   ratingValue: rating,
    //   reviewCount: reviewCount,
    // },
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: faqData,
    },
  };

  return <JsonLd data={data} />;
}
