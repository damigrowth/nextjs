import { FaqContent } from '@/components/content';
import { data } from '@/constants/faq';

export const metadata = {
  title: 'Doulitsa - Freelance Marketplace React/Next Js Template | FAQ',
};

export default async function FAQPage() {
  return <FaqContent data={data} />;
}
