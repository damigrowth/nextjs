import Breadcumb6 from "@/components/breadcumb/Breadcumb6";
import Banner from "@/components/ui/Archives/Banner";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import ServicesArchive from "@/components/ui/Archives/Services/ServicesArchive";
import Tabs from "@/components/ui/Archives/Tabs";
import { getData } from "@/lib/client/operations";
import { CATEGORIES_SEARCH } from "@/lib/graphql/queries";
import React from "react";

export default async function page({ params, searchParams }) {
  const { category } = params;

  const { min, max, time, cat, cat_s, ver, page, sort } = searchParams;

  const addFilter = (condition, value) => (condition ? value : undefined);

  const paramsFilters = {
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    time: addFilter(time, parseInt(time, 10)),
    cat: category,
    verified: addFilter(ver, ver === "true"),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;

  const { categories } = await getData(CATEGORIES_SEARCH, {
    label: categorySearch,
  });

  return (
    <>
      <Tabs
        parentPathLabel="Όλες οι κατηγορίες"
        parentPathLink="ipiresies"
        category={category}
        categories={categories?.data}
      />
      <Breadcrumb
        parentPathLabel="Υπηρεσίες"
        parentPathLink="ipiresies"
        category={category}
        categories={categories?.data}
      />
      <Banner category={category} categories={categories?.data} />
      <ServicesArchive
        categories={categories?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        childPath
      />
    </>
  );
}
