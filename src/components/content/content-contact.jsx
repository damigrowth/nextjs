import React from 'react';

import Breadcrumb from '../breadcrumb/breadcrumb-about';
import Contact from '../section/section-contact';
import Faq from '../section/section-contact-faq';

export default function ContactContent({ data }) {
  return (
    <>
      <Breadcrumb data={data.breadcrumb} />
      <Contact data={data.contact} />
      <Faq data={data.faq} className={'pt0 pb100'} />
    </>
  );
}
