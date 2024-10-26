import React from "react";
import { getData } from "@/lib/client/operations";
import { Meta } from "@/utils/Seo/Meta/Meta";
import {
  CATEGORIES,
  SUBCATEGORIES_SEARCH_FILTERED,
} from "@/lib/graphql/queries/main/taxonomies/service";
import Tabs from "@/components/ui/Archives/Tabs";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Banner from "@/components/ui/Archives/Banner";
import ServicesArchive from "@/components/ui/Archives/Services/ServicesArchive";

export const revalidate = 3600;

// Dynamic SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: "Υπηρεσίες | Doulitsa",
    descriptionTemplate:
      "Ανακαλύψτε τις υπηρεσίες που χρειάζεστε απο τους επαγγελματίες μας.",
    size: 150,
    url: "/ipiresies",
  });

  return meta;
}

export default async function page({ searchParams }) {
  const { categories } = await getData(CATEGORIES);

  const {
    search,
    min,
    max,
    time,
    cat,
    cat_s,
    subc_p,
    subc_ps,
    ver,
    page,
    sort,
  } = searchParams;

  const addFilter = (condition, value) => (condition ? value : undefined);

  const paramsFilters = {
    search: search || undefined,
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    time: addFilter(time, parseInt(time, 10)),
    cat: addFilter(cat, parseInt(cat, 10)),
    subcategoryPage: addFilter(subc_p, parseInt(subc_p, 10)),
    subcategoryPageSize: addFilter(subc_ps, parseInt(subc_ps, 10)),
    verified: addFilter(ver === "", true),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;

  const { subcategoriesSearch } = await getData(SUBCATEGORIES_SEARCH_FILTERED, {
    searchTerm: categorySearch,
    subcategoryPage: paramsFilters.subcategoryPage,
    subcategoryPageSize: paramsFilters.subcategoryPageSize,
  });

  const selectData = {
    option: "cat",
    search: "cat_s",
    page: "subc_p",
    pageSize: "subc_ps",
    options: subcategoriesSearch?.data,
    pagination: subcategoriesSearch?.meta?.pagination,
    rootLabel: "Όλες οι κατηγορίες",
    defaultLabel: "Όλες οι κατηγορίες",
    // defaultLabel={currCategory ? `${currCategory}` : "Όλες οι κατηγορίες"}
  };

  return (
    <>
      <Tabs
        parentPathLabel="Όλες οι κατηγορίες"
        parentPathLink="categories"
        categories={categories?.data}
      />
      <Breadcrumb parentPathLabel="Υπηρεσίες" parentPathLink="ipiresies" />
      <Banner
        heading="Όλες οι Υπηρεσίες"
        description="Ανακαλύψτε τις υπηρεσίες που χρειάζεστε απο τους επαγγελματίες μας."
      />
      <ServicesArchive
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        selectData={selectData}
        childPath
      />
    </>
  );
}
