import FaqSection from '@/components/shared/faq-section';
import FeaturesGrid from '@/components/shared/features-grid';
import FeaturesRow from '@/components/shared/features-row';
import HeroBanner from '@/components/shared/hero-banner';
import StatisticsCounter from '@/components/shared/statistics-counter';
import TabbedCta from '@/components/shared/tabbed-cta';
import { getForProsMetadata } from '@/lib/seo/pages';
import { data } from '@/constants/datasets/for-pros';

export async function generateMetadata() {
  return getForProsMetadata();
}

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
