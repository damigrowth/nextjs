import React from 'react';

const JsonLd = ({ data }) => {
  const jsonData = JSON.stringify(data);

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: jsonData }}
    />
  );
};

export default JsonLd;
