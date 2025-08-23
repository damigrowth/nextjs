import {
  BannerAbout,
  FaqAbout,
  FeaturesAbout,
  FeaturesCounterAbout,
  FeaturesImageAbout,
  FeaturesStatsAbout,
  TestimonialsAbout,
} from '@/components';
import React from 'react';

type Props = {};

export default function AboutPage({}: Props) {
  return (
    <>
      <BannerAbout />
      <FeaturesCounterAbout />
      <FeaturesAbout />
      <FeaturesStatsAbout />
      <TestimonialsAbout />
      <FeaturesImageAbout />
      <FaqAbout />
    </>
  );
}
