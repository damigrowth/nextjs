import React from "react";
import ServicesArchive from "@/components/ui/Archives/Services/ServicesArchive";
import { getData } from "@/lib/client/operations";
import { dynamicMeta, Meta } from "@/utils/Seo/Meta/Meta";
import {
  CATEGORIES,
  SUBDIVISIONS_SEARCH_FILTERED,
  TAXONOMIES_BY_SLUG,
} from "@/lib/graphql/queries/main/taxonomies/service";
import Tabs from "@/components/ui/Archives/Tabs";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Banner from "@/components/ui/Archives/Banner";
import { inspect } from "@/utils/inspect";

export const dynamic = "force-dynamic";
export const revalidate = 3600;
export const dynamicParams = true;

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { subcategory, subdivision } = params;

  const data = {
    type: "subdivision",
    params: { category: "", subcategory: "", subdivision },
    titleTemplate: "%arcCategory% - Βρες τις καλύτερες Υπηρεσίες στη Doulitsa",
    descriptionTemplate: "%arcCategoryDesc%",
    size: 100,
    url: `/ipiresies/${subcategory}/${subdivision}`,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { subcategory, subdivision } = params;

  const { categories } = await getData(CATEGORIES);

  const { subcategoryBySlug, subdivisionBySlug } = await getData(
    TAXONOMIES_BY_SLUG,
    {
      subcategory,
      subdivision,
    }
  );

  const currCategory =
    subdivisionBySlug?.data[0]?.attributes?.category?.data?.attributes;
  const currSubcategory = subcategoryBySlug?.data[0]?.attributes;
  const currSubdivision = subdivisionBySlug?.data[0]?.attributes;

  const taxonomies = {
    current: currSubcategory?.label,
    category: currCategory,
    subcategory: currSubcategory,
    subdivision: currSubdivision,
  };

  const {
    search,
    min,
    max,
    time,
    cat,
    cat_s,
    subd_p,
    subd_ps,
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
    cat: subdivision,
    subdivisionPage: addFilter(subd_p, parseInt(subd_p, 10)),
    subdivisionPageSize: addFilter(subd_ps, parseInt(subd_ps, 10)),
    verified: addFilter(ver === "", true),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;

  const { subdivisionsSearch } = await getData(SUBDIVISIONS_SEARCH_FILTERED, {
    subcategorySlug: subcategory,
    searchTerm: categorySearch,
    subdivisionPage: paramsFilters.subdivisionPage,
    subdivisionPageSize: paramsFilters.subdivisionPageSize,
  });

  const selectData = {
    option: "cat",
    search: "cat_s",
    page: "subd_p",
    pageSize: "subd_ps",
    options: subdivisionsSearch?.data,
    pagination: subdivisionsSearch?.meta?.pagination,
    rootLabel: "Όλες οι κατηγορίες",
    defaultLabel: `${
      taxonomies.current ? taxonomies.current : "Όλες οι κατηγορίες"
    }`,
  };

  return (
    <>
      <Tabs
        parentPathLabel="Όλες οι κατηγορίες"
        parentPathLink="ipiresies"
        categories={categories?.data}
        categoriesRoute={true}
      />
      <Breadcrumb
        parentPathLabel="Υπηρεσίες"
        parentPathLink="ipiresies"
        category={currCategory}
        subcategory={currSubcategory}
        subdivision={currSubdivision}
        categoriesRoute={true}
      />
      <Banner
        heading={currSubdivision.label}
        description={currSubdivision.description}
        image={currSubdivision.image?.data?.attributes?.formats?.small?.url}
      />
      <ServicesArchive
        taxonomies={taxonomies}
        categories={subdivisionsSearch?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        selectData={selectData}
        childPath
      />
    </>
  );
}
