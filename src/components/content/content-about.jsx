import React from 'react';

import { Breadcrumb } from '@/components/breadcrumb';
import { CounterAbout } from '@/components/counter';
import { About, Cta2, FunFact, TestimonialsAbout } from '@/components/section';
import Cta1 from '@/components/section/section-about-cta-1';

import Faq from '../section/section-contact-faq';

export default function AboutContent({ data }) {
  return (
    <>
      <Breadcrumb data={data.breadcrumb} />
      <About data={data.about} />
      <CounterAbout data={data.counter.data} />
      <Cta1 data={data.cta1} />
      <FunFact data={data.funFact} />
      <TestimonialsAbout data={data.testimonials} />
      <Cta2 data={data.cta2} />
      <Faq data={data.faq} />
      {/* <Pricing data={data.pricing} /> */}
    </>
  );
}
