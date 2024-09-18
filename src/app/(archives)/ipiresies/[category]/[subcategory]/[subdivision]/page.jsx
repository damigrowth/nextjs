import React from "react";
import ServicesArchive from "@/components/ui/Archives/Services/ServicesArchive";
import { getData } from "@/lib/client/operations";
import { dynamicMeta } from "@/utils/Seo/Meta/dynamicMeta";
import {
  CATEGORIES,
  SUBDIVISIONS_SEARCH,
  TAXONOMIES_BY_SLUG,
} from "@/lib/graphql/queries/main/taxonomies/service";
import Tabs from "@/components/ui/Archives/Tabs";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Banner from "@/components/ui/Archives/Banner";
import { inspect } from "@/utils/inspect";

// Dynamic SEO
// export async function generateMetadata({ params }) {
//   const { subdivision } = params;

//   const titleTemplate =
//     "%arcCategory% - Βρες τις καλύτερες Υπηρεσίες στη Doulitsa";
//   const descriptionTemplate = "%arcCategoryDesc%";
//   const descriptionSize = 100;

//   const { meta } = await dynamicMeta(
//     "subcategories",
//     undefined,
//     titleTemplate,
//     descriptionTemplate,
//     descriptionSize,
//     true,
//     subdivision
//   );

//   return meta;
// }

export default async function page({ params, searchParams }) {
  const { category, subcategory, subdivision } = params;

  const { categories } = await getData(CATEGORIES);

  const { categoryBySlug, subcategoryBySlug, subdivisionBySlug } =
    await getData(TAXONOMIES_BY_SLUG, {
      category,
      subcategory,
      subdivision,
    });

  const currCategory = categoryBySlug?.data[0]?.attributes;
  const currSubcategory = subcategoryBySlug?.data[0]?.attributes;
  const currSubdivision = subdivisionBySlug?.data[0]?.attributes;

  const { search, min, max, time, cat, cat_s, ver, page, sort } = searchParams;

  const addFilter = (condition, value) => (condition ? value : undefined);

  const paramsFilters = {
    search: search || undefined,
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    time: addFilter(time, parseInt(time, 10)),
    cat: subdivision,
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
        subdivision={currSubdivision}
      />
      <Banner
        heading={currSubdivision.label}
        description={currSubdivision.description}
        image={currSubdivision.image?.data?.attributes?.formats?.small?.url}
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
