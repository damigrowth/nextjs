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

export const revalidate = 3600;

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: "Υπηρεσίες | Doulitsa",
    descriptionTemplate:
      "Ανακαλύψτε τις υπηρεσίες που χρειάζεστε απο τους επαγγελματίες μας.",
    size: 150,
  });

  return meta;
}

export default async function page() {
  const { categories } = await getData(CATEGORIES);

  const { archive } = await getData(TAXONOMIES_ARCHIVE, {
    category: "pliroforiki",
  });

  return (
    <>
      <Tabs
        parentPathLabel="Όλες οι κατηγορίες"
        parentPathLink="ipiresies"
        categories={categories?.data}
      />
      <Breadcrumb parentPathLabel="Υπηρεσίες" parentPathLink="ipiresies" />
      <Banner
        heading="Όλες οι Υπηρεσίες"
        description="Ανακαλύψτε τις υπηρεσίες που χρειάζεστε απο τους επαγγελματίες μας."
      />
      <TaxonomiesArchive archive={archive} />
    </>
  );
}