import React from 'react';

import JsonLd from './JsonLd';

export default function HomeSchema() {
  const baseUrl = process.env.LIVE_URL;

  const logoUrl = `https://res.cloudinary.com/ddejhvzbf/image/upload/v1750080997/Static/doulitsa-logo_t9qnum.svg`;

  const searchUrlTemplate = `/ipiresies?search={search_term_string}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Doulitsa',
    url: baseUrl,
    logo: logoUrl,
    sameAs: ['https://www.linkedin.com/company/doulitsa'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}${searchUrlTemplate}`,
      'query-input': {
        '@type': 'PropertyValueSpecification',
        valueRequired: true,
        valueName: 'search_term_string',
      },
    },
  };

  return <JsonLd data={schema} />;
}
