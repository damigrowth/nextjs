import React from "react";
import ServicesArchive from "@/components/ui/Archives/Services/ServicesArchive";
import { getData } from "@/lib/client/operations";
import { dynamicMeta } from "@/utils/Seo/Meta/dynamicMeta";
import {
  CATEGORIES,
  TAXONOMIES_BY_SLUG,
  SUBCATEGORY_SUBDIVISIONS_SEARCH,
} from "@/lib/graphql/queries/main/taxonomies/service";
import Tabs from "@/components/ui/Archives/Tabs";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Banner from "@/components/ui/Archives/Banner";

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { subcategory } = params;

  const titleTemplate =
    "%arcCategory% - Βρες τις καλύτερες Υπηρεσίες στη Doulitsa";
  const descriptionTemplate = "%arcCategoryDesc%";
  const descriptionSize = 100;

  const { meta } = await dynamicMeta(
    "subcategories",
    undefined,
    titleTemplate,
    descriptionTemplate,
    descriptionSize,
    true,
    subcategory
  );

  return meta;
}

export default async function page({ params, searchParams }) {
  const { category, subcategory, subdivision } = params;

  const { categories } = await getData(CATEGORIES);

  const {
    categories: categoriesData,
    subcategories: subcategoriesData,
    subdivisions: subdivisionsData,
  } = await getData(TAXONOMIES_BY_SLUG, {
    category,
    subcategory,
    subdivision: "",
  });
  const currCategory = categoriesData?.data[0]?.attributes;
  const currSubcategory = subcategoriesData?.data[0]?.attributes;
  const currSubdivision = subdivisionsData?.data[0]?.attributes;

  const { search, min, max, time, cat, cat_s, ver, page, sort } = searchParams;

  const addFilter = (condition, value) => (condition ? value : undefined);

  const paramsFilters = {
    search: search || undefined,
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    time: addFilter(time, parseInt(time, 10)),
    cat: subcategory,
    verified: addFilter(ver === "", true),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;

  const { subdivisions } = await getData(SUBCATEGORY_SUBDIVISIONS_SEARCH, {
    subcategorySlug: subcategory,
    searchTerm: categorySearch,
  });

  // inspect(subdivisions);

  return (
    <>
      <Tabs
        parentPathLabel="Όλες οι κατηγορίες"
        parentPathLink="ipiresies"
        categories={categories?.data}
      />
      <Breadcrumb
        parentPathLabel="Υπηρεσίες"
        parentPathLink="ipiresies"
        category={currCategory}
        subcategory={currSubcategory}
        subdivision={currSubcategory}
      />
      <Banner
        heading={currSubcategory?.label}
        description={currSubcategory?.description}
        image={currSubcategory?.image?.data?.attributes?.formats?.small?.url}
      />
      <ServicesArchive
        currCategory={currSubcategory?.label}
        categories={subdivisions?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        childPath
      />
    </>
  );
}
