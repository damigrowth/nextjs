import React from 'react';

import { Banner } from '@/components/banner';
import { BreadcrumbArchives } from '@/components/breadcrumb';
import { ServicesArchive } from '@/components/content';
import { Tabs } from '@/components/section';
import { getData } from '@/lib/client/operations';
import {
  CATEGORIES,
  SUBDIVISIONS_FOR_FILTERED_SERVICES,
  SUBDIVISIONS_SEARCH_FILTERED,
  TAGS_FOR_FILTERED_SERVICES_WITH_CATEGORY,
  TAGS_SEARCH,
  TAXONOMIES_BY_SLUG,
} from '@/lib/graphql';
import { normalizeTerm } from '@/utils/normalizeTerm';
import { Meta } from '@/utils/Seo/Meta/Meta';

export const dynamic = 'auto';
export const revalidate = 1800;

export const dynamicParams = true;

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { subcategory, subdivision } = await params;

  const data = {
    type: 'subdivision',
    params: { category: '', subcategory: '', subdivision },
    titleTemplate: '%arcCategory% - Βρες τις καλύτερες Υπηρεσίες στη Doulitsa',
    descriptionTemplate: '%arcCategoryDesc%',
    size: 100,
    url: `/ipiresies/${subcategory}/${subdivision}`,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { subcategory, subdivision } = await params;

  const { categories } = await getData(CATEGORIES);

  const { subcategoryBySlug, subdivisionBySlug } = await getData(
    TAXONOMIES_BY_SLUG,
    {
      subcategory,
      subdivision,
    },
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
    search: normalizeTerm(search || '') || undefined,
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    time: addFilter(time, parseInt(time, 10)),
    cat: subdivision,
    subdivisionPage: addFilter(subd_p, parseInt(subd_p, 10)),
    subdivisionPageSize: addFilter(subd_ps, parseInt(subd_ps, 10)),
    tagsPage: addFilter(tags_p, parseInt(tags_p, 10)) || 1,
    tagsPageSize: addFilter(tags_ps, parseInt(tags_ps, 10)) || 10,
    tags: tags?.split(',').filter(Boolean),
    verified: addFilter(ver === '', true),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : 'publishedAt:desc',
  };

  let categorySearch = cat_s ? cat_s : undefined;

  let tagsSearch = tags_s ? tags_s : undefined;

  // Fetch subdivisions based on filtered services
  const { subdivisionsForFilteredResults } = await getData(
    SUBDIVISIONS_FOR_FILTERED_SERVICES,
    {
      search: paramsFilters.search,
      min: paramsFilters.min,
      max: paramsFilters.max,
      time: paramsFilters.time,
      subcategorySlug: subcategory,
      tags: paramsFilters.tags,
      verified: paramsFilters.verified,
      subdivisionPage: paramsFilters.subdivisionPage,
      subdivisionPageSize: paramsFilters.subdivisionPageSize,
    },
  );

  // Fallback to old query for search functionality only
  const { subdivisionsSearch } = await getData(SUBDIVISIONS_SEARCH_FILTERED, {
    subcategorySlug: subcategory,
    searchTerm: categorySearch,
    subdivisionPage: paramsFilters.subdivisionPage,
    subdivisionPageSize: paramsFilters.subdivisionPageSize,
  });

  // Fetch tags based on filtered services with category filter
  const { tagsForFilteredResults, tagsBySlug } = await getData(
    TAGS_FOR_FILTERED_SERVICES_WITH_CATEGORY,
    {
      search: paramsFilters.search,
      min: paramsFilters.min,
      max: paramsFilters.max,
      time: paramsFilters.time,
      cat: subdivision,
      verified: paramsFilters.verified,
      tagsPage: paramsFilters.tagsPage,
      tagsPageSize: paramsFilters.tagsPageSize,
      label: tagsSearch || '',
      slugs: paramsFilters.tags || [],
    },
    'tags',
  );

  // Fallback to old query for search functionality only
  const { tagsBySearch: oldTagsBySearch } = tagsSearch
    ? await getData(
        TAGS_SEARCH,
        {
          label: tagsSearch,
          tagsPage: paramsFilters.tagsPage,
          tagsPageSize: paramsFilters.tagsPageSize,
          slugs: paramsFilters.tags,
        },
        'tags',
      )
    : { tagsBySearch: { data: [], meta: { pagination: {} } } };

  const multiSelectData = {
    option: 'tags',
    search: 'tags_s',
    page: 'tags_p',
    pageSize: 'tags_ps',
    rootLabel: 'Όλα τα tags',
    defaultLabel: 'Όλα τα tags',
    // Combine both results and remove duplicates by slug
    options: [
      ...new Map(
        [
          ...(tagsSearch
            ? oldTagsBySearch?.data || []
            : tagsForFilteredResults?.data || []),
          ...(tagsBySlug?.data || []),
        ].map((item) => [item.attributes.slug, item]),
      ).values(),
    ],
    pagination: tagsSearch
      ? oldTagsBySearch?.meta?.pagination
      : tagsForFilteredResults?.meta?.pagination,
  };

  const selectData = {
    option: 'cat',
    search: 'cat_s',
    page: 'subd_p',
    pageSize: 'subd_ps',
    // Use filtered results if available, otherwise use search results
    options: categorySearch
      ? subdivisionsSearch?.data || []
      : subdivisionsForFilteredResults?.data || [],
    pagination: categorySearch
      ? subdivisionsSearch?.meta?.pagination
      : subdivisionsForFilteredResults?.meta?.pagination,
    rootLabel: 'Όλες οι κατηγορίες',
    defaultLabel: `${taxonomies.current ? taxonomies.current : 'Όλες οι κατηγορίες'}`,
  };

  return (
    <>
      <Tabs
        type='service'
        categories={categories?.data}
        categoriesRoute={true}
      />
      <BreadcrumbArchives
        parentPathLabel='Υπηρεσίες'
        parentPathLink='ipiresies'
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
        searchParams={allSearchParams}
        paramsFilters={paramsFilters}
        selectData={selectData}
        multiSelectData={multiSelectData}
        childPath
      />
    </>
  );
}
