import {
  HeroBanner,
  ContentHero,
  StatisticsCounter,
  FeaturesGrid,
  StatsGrid,
  TestimonialsSection,
  ProcessSteps,
  FaqSection,
} from '@/components/shared';
import { data } from '@/constants/datasets/about';
import { getAboutMetadata } from '@/lib/seo/pages';
import React from 'react';

export async function generateMetadata() {
  return getAboutMetadata();
}

export default function AboutPage() {
  return (
    <>
      <HeroBanner data={data.banner} />
      <ContentHero data={data.about} />
      <StatisticsCounter data={data.counter} />
      <FeaturesGrid data={data.features} />
      <StatsGrid data={data.featuresStats} />
      <TestimonialsSection data={data.testimonials} />
      <ProcessSteps data={data.featuresImage} />
      <FaqSection data={data.faq} />
    </>
  );
}
