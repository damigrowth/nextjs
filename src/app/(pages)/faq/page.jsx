import { FaqContent } from '@/components/content';
import { data } from '@/constants/faq';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Doulitsa - Freelance Marketplace React/Next Js Template | FAQ',
};

export default async function FAQPage() {
  return <FaqContent data={data} />;
}
