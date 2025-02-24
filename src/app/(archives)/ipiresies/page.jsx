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
import { TAGS_SEARCH } from "@/lib/graphql/queries/main/taxonomies/service/tag";
import { normalizeTerm } from "@/utils/normalizeTerm";

export const dynamic = "force-dynamic";
export const revalidate = 3600;
export const dynamicParams = true;

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
    tags,
    tags_s,
    tags_p,
    tags_ps,
    ver,
    page,
    sort,
  } = await searchParams;

  const allSearchParams = await searchParams;

  const addFilter = (condition, value) => (condition ? value : undefined);

  const paramsFilters = {
    search: normalizeTerm(search) || undefined,
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    time: addFilter(time, parseInt(time, 10)),
    cat: addFilter(cat, parseInt(cat, 10)),
    subcategoryPage: addFilter(subc_p, parseInt(subc_p, 10)),
    subcategoryPageSize: addFilter(subc_ps, parseInt(subc_ps, 10)),
    tagsPage: addFilter(tags_p, parseInt(tags_p, 10)) || 1,
    tagsPageSize: addFilter(tags_ps, parseInt(tags_ps, 10)) || 10,
    tags: tags?.split(",").filter(Boolean),
    verified: addFilter(ver === "", true),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;
  let tagsSearch = tags_s ? tags_s : undefined;

  const { subcategoriesSearch } = await getData(SUBCATEGORIES_SEARCH_FILTERED, {
    searchTerm: categorySearch,
    subcategoryPage: paramsFilters.subcategoryPage,
    subcategoryPageSize: paramsFilters.subcategoryPageSize,
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
    page: "subc_p",
    pageSize: "subc_ps",
    options: subcategoriesSearch?.data,
    pagination: subcategoriesSearch?.meta?.pagination,
    rootLabel: "Όλες οι κατηγορίες",
    defaultLabel: "Όλες οι κατηγορίες",
    // defaultLabel={currCategory ? `${currCategory}` : "Όλες οι κατηγορίες"}
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
        parentPathLink="categories"
        categories={categories?.data}
      />
      <Breadcrumb parentPathLabel="Υπηρεσίες" parentPathLink="ipiresies" />
      <Banner
        heading="Όλες οι Υπηρεσίες"
        description="Ανακαλύψτε τις υπηρεσίες που χρειάζεστε απο τους επαγγελματίες μας."
      />
      <ServicesArchive
        searchParams={allSearchParams}
        paramsFilters={paramsFilters}
        selectData={selectData}
        multiSelectData={multiSelectData}
        childPath
      />
    </>
  );
}
