import React from "react";
import ServicesArchive from "@/components/ui/Archives/Services/ServicesArchive";
import { getData } from "@/lib/client/operations";
import { dynamicMeta, Meta } from "@/utils/Seo/Meta/Meta";
import {
  CATEGORIES,
  TAXONOMIES_BY_SLUG,
  SUBDIVISIONS_SEARCH,
} from "@/lib/graphql/queries/main/taxonomies/service";
import Tabs from "@/components/ui/Archives/Tabs";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Banner from "@/components/ui/Archives/Banner";

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { subcategory } = params;

  const data = {
    type: "subcategory",
    params: { category: "", subcategory, subdivision: "" },
    titleTemplate: "%arcCategory% - Βρες τις καλύτερες Υπηρεσίες στη Doulitsa",
    descriptionTemplate: "%arcCategoryDesc%",
    size: 100,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { category, subcategory } = params;

  const { categories } = await getData(CATEGORIES);

  const { categoryBySlug, subcategoryBySlug } = await getData(
    TAXONOMIES_BY_SLUG,
    {
      category,
      subcategory,
      subdivision: "",
    }
  );

  const currCategory = categoryBySlug?.data[0]?.attributes;
  const currSubcategory = subcategoryBySlug?.data[0]?.attributes;

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

  const { subdivisionsSearch } = await getData(SUBDIVISIONS_SEARCH, {
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
        categories={subdivisionsSearch?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        childPath
      />
    </>
  );
}
