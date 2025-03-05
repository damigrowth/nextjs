import React from "react";
import { getData } from "@/lib/client/operations";
import { Meta } from "@/utils/Seo/Meta/Meta";
import {
  CATEGORIES,
  TAXONOMIES_ARCHIVE,
} from "@/lib/graphql/queries/main/taxonomies/service";
import Tabs from "@/components/ui/Archives/Tabs";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Banner from "@/components/ui/Archives/Banner";
import TaxonomiesArchive from "@/components/ui/Archives/Taxonomies/TaxonomiesArchive";

export const dynamic = "force-dynamic";
export const revalidate = 3600;
export const dynamicParams = true;

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { category } = await params;

  const data = {
    type: "category",
    params: { category: category, subcategory: "", subdivision: "" },
    titleTemplate: "%arcCategory% - Βρες τις καλύτερες Υπηρεσίες στη Doulitsa",
    descriptionTemplate: "%arcCategoryDesc%",
    size: 100,
    url: `/categories/${category}`,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params }) {
  const { category } = await params;

  const { categories } = await getData(CATEGORIES);

  const { archive } = await getData(TAXONOMIES_ARCHIVE, {
    category,
  });

  const archiveCategory = archive?.category;

  return (
    <>
      <Tabs type="categories" categories={categories?.data} />
      <Breadcrumb
        parentPathLabel="Υπηρεσίες"
        parentPathLink="categories"
        category={archiveCategory}
      />
      <Banner
        heading={archiveCategory?.label}
        description={archiveCategory?.description}
        image={archiveCategory?.image?.data?.attributes?.formats?.small?.url}
      />
      <TaxonomiesArchive archive={archive} />
    </>
  );
}
