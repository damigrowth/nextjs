import {
  HeroBanner,
  TabbedCta,
  StatisticsCounter,
  FaqSection,
  FeaturesGrid,
  FeaturesRow,
} from '@/components/shared';
import { data } from '@/constants/datasets/for-pros';
import React from 'react';

export default function ForProsPage() {
  return (
    <>
      <HeroBanner
        data={{
          title: data.banner.title,
          description: data.banner.description,
        }}
        backgroundColor={data.banner.backgroundColor}
        decorativeImages={data.banner.decorativeImages}
      />
      <TabbedCta data={data.tabs} />
      <FeaturesRow data={data.featuresRow} />
      <FeaturesGrid data={data.featuresGrid} />
      <StatisticsCounter data={data.counter} />
      <FaqSection data={data.faq} />
    </>
  );
}
