import React from "react";
import ServicesArchive from "@/components/ui/Archives/Services/ServicesArchive";
import { getData } from "@/lib/client/operations";
import { Meta } from "@/utils/Seo/Meta/Meta";
import {
  CATEGORIES,
  TAXONOMIES_BY_SLUG,
  SUBDIVISIONS_SEARCH_FILTERED,
} from "@/lib/graphql/queries/main/taxonomies/service";
import Tabs from "@/components/ui/Archives/Tabs";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Banner from "@/components/ui/Archives/Banner";
import { TAGS_SEARCH } from "@/lib/graphql/queries/main/taxonomies/service/tag";

export const dynamic = "force-dynamic";
export const revalidate = 3600;
export const dynamicParams = true;

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { subcategory } = params;

  const data = {
    type: "subcategory",
    params: { category: "", subcategory, subdivision: "" },
    titleTemplate: "%arcCategory% - Βρες τις καλύτερες Υπηρεσίες στη Doulitsa",
    descriptionTemplate: "%arcCategoryDesc%",
    size: 100,
    url: `/ipiresies/${subcategory}`,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { subcategory } = params;

  const { categories } = await getData(CATEGORIES);

  const { subcategoryBySlug } = await getData(TAXONOMIES_BY_SLUG, {
    subcategory,
    subdivision: "",
  });

  const currCategory =
    subcategoryBySlug?.data[0]?.attributes?.category?.data?.attributes;
  const currSubcategory = subcategoryBySlug?.data[0]?.attributes;

  const taxonomies = {
    current: currSubcategory?.label,
    category: currCategory,
    subcategory: currSubcategory,
    subdivision: null,
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
    tags,
    tags_s,
    tags_p,
    tags_ps,
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
    cat: subcategory,
    subdivisionPage: addFilter(subd_p, parseInt(subd_p, 10)),
    subdivisionPageSize: addFilter(subd_ps, parseInt(subd_ps, 10)),
    tagsPage: addFilter(tags_p, parseInt(tags_p, 10)) || 1,
    tagsPageSize: addFilter(tags_ps, parseInt(tags_ps, 10)) || 10,
    tags: tags?.split(",").filter(Boolean) || [],
    verified: addFilter(ver === "", true),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;
  let tagsSearch = tags_s ? tags_s : undefined;

  const { subdivisionsSearch } = await getData(SUBDIVISIONS_SEARCH_FILTERED, {
    subcategorySlug: subcategory,
    searchTerm: categorySearch,
    subdivisionPage: paramsFilters.subdivisionPage,
    subdivisionPageSize: paramsFilters.subdivisionPageSize,
  });

  const { tagsBySearch, tagsBySlug } = await getData(
    TAGS_SEARCH,
    {
      label: tagsSearch,
      tagsPage: paramsFilters.tagsPage,
      tagsPageSize: paramsFilters.tagsPageSize,
      slugs: paramsFilters.tags,
    },
    "tags"
  );

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

  const multiSelectData = {
    option: "tags",
    search: "tags_s",
    page: "tags_p",
    pageSize: "tags_ps",
    rootLabel: "Όλα τα tags",
    defaultLabel: "Όλα τα tags",
    // Combine both results and remove duplicates by slug
    options: [
      ...new Map(
        [...(tagsBySearch?.data || []), ...(tagsBySlug?.data || [])].map(
          (item) => [item.attributes.slug, item]
        )
      ).values(),
    ],
    pagination: tagsBySearch?.meta?.pagination,
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
        subdivision={currSubcategory}
        categoriesRoute={true}
      />
      <Banner
        heading={currSubcategory?.label}
        description={currSubcategory?.description}
        image={currSubcategory?.image?.data?.attributes?.formats?.small?.url}
      />
      <ServicesArchive
        taxonomies={taxonomies}
        categories={subdivisionsSearch?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        selectData={selectData}
        multiSelectData={multiSelectData}
        childPath
      />
    </>
  );
}
