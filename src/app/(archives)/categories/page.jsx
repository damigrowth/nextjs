import React from "react";
import { getData } from "@/lib/client/operations";
import Tabs from "@/components/ui/Archives/Tabs";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Banner from "@/components/ui/Archives/Banner";
import {
  CATEGORIES,
  TAXONOMIES_ARCHIVE,
} from "@/lib/graphql/queries/main/taxonomies/service";
import { Meta } from "@/utils/Seo/Meta/Meta";
import TaxonomiesArchive from "@/components/ui/Archives/Taxonomies/TaxonomiesArchive";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: "Κατηγορίες | Doulitsa",
    descriptionTemplate:
      "Ανακάλυψε τις κατηγορίες υπηρεσιών που χρειάζεσαι απο τους επαγγελματίες μας.",
    size: 150,
    url: "/categories",
  });

  return meta;
}

export default async function page() {
  const { categories } = await getData(CATEGORIES);

  const { archive } = await getData(TAXONOMIES_ARCHIVE, {
    category: "",
  });

  return (
    <>
      <Tabs type="categories" categories={categories?.data} />
      <Breadcrumb parentPathLabel="Κατηγορίες" parentPathLink="categories" />
      <Banner
        heading="Όλες οι Κατηγορίες"
        description="Ανακάλυψε όλες τις υπηρεσίες για κάθε ανάγκη από τους καλύτερους επαγγελματίες."
      />
      <TaxonomiesArchive archive={archive} />
    </>
  );
}
