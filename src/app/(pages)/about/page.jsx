import React from "react";
import AboutContent from "@/components/ui/Pages/AboutContent";
import { data } from "@/data/pages/about";
import { Meta } from "@/utils/Seo/Meta/Meta";

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: "Σχετικά με τη Doulitsa",
    descriptionTemplate:
      "Σχετικά με τη Doulitsa, Ανακάλυψε εξειδικευμένους επαγγελματίες και υπηρεσίες από όλη την Ελλάδα. Από ψηφιακές υπηρεσίες έως τεχνικές εργασίες, έχουμε ό,τι χρειάζεσαι.",
    size: 160,
    url: "/about",
  });

  return meta;
}

export default function AboutPage() {
  return <AboutContent data={data} />;
}
