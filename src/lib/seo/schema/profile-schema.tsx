import React from 'react';
import { JsonLd } from './json-ld';

interface ProfileSchemaProps {
  username: string;
  displayName: string;
  location?: string;
  // rating: number;
  // reviewCount: number;
  image?: string | null;
}

/**
 * LocalBusiness schema for profile detail pages
 * Includes location and business information
 */
export function ProfileSchema({
  username,
  displayName,
  location,
  // rating,
  // reviewCount,
  image,
}: ProfileSchemaProps) {
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.LIVE_URL || 'https://doulitsa.gr';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: displayName,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location || 'Greece',
      addressCountry: 'GR',
    },
    // aggregateRating: {
    //   '@type': 'AggregateRating',
    //   ratingValue: rating,
    //   reviewCount: reviewCount,
    // },
    url: `${baseUrl}/profile/${encodeURIComponent(username)}`,
    image: image || undefined,
    sameAs: baseUrl,
  };

  return <JsonLd data={data} />;
}
