import React from "react";
import ServicesArchive from "@/components/ui/Archives/Services/ServicesArchive";
import { getData } from "@/lib/client/operations";
import { CATEGORY_SUBCATEGORIES_SEARCH } from "@/lib/graphql/queries";

export default async function page({ params, searchParams }) {
  const category = params.category[0];
  const subcategory = params.category[1];

  const { search, min, max, time, cat, cat_s, ver, page, sort } = searchParams;

  const addFilter = (condition, value) => (condition ? value : undefined);

  const paramsFilters = {
    search: search || undefined,
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    time: addFilter(time, parseInt(time, 10)),
    cat: category,
    verified: addFilter(ver, ver === "true"),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;

  const { subcategories } = await getData(CATEGORY_SUBCATEGORIES_SEARCH, {
    categorySlug: category,
    searchTerm: categorySearch,
  });

  // inspect(subcategories);

  return (
    <>
      <ServicesArchive
        categories={subcategories?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        childPath
      />
    </>
  );
}
