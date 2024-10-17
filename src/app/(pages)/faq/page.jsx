import FaqSuggestion from "@/components/section/FaqSuggestion";
import FaqContent from "@/components/ui/Pages/FaqContent";
import { data } from "@/data/pages/faq";

export const metadata = {
  title: "Doulitsa - Freelance Marketplace React/Next Js Template | FAQ",
};

export default async function FAQPage() {
  return <FaqContent data={data} />;
}
