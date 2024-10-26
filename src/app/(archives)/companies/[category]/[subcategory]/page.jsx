import Banner from "@/components/ui/Archives/Banner";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import FreelancersArchive from "@/components/ui/Archives/Freelancers/FreelancersArchive";
import Tabs from "@/components/ui/Archives/Tabs";
import { getData } from "@/lib/client/operations";
import { COUNTIES_SEARCH } from "@/lib/graphql/queries/main/location";
import {
  FREELANCER_CATEGORIES,
  FREELANCER_SUBCATEGORIES_SEARCH_FILTERED,
  FREELANCER_TAXONOMIES_BY_SLUG,
} from "@/lib/graphql/queries/main/taxonomies/freelancer";
import { Meta } from "@/utils/Seo/Meta/Meta";

export const dynamic = "force-dynamic";
export const revalidate = 3600;
export const dynamicParams = true;

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { category, subcategory } = params;

  const data = {
    type: "freelancerSubcategory",
    params: { category: "", subcategory, type: "company" },
    titleTemplate: "%arcCategoryPlural% - Αναζήτηση για Επιχειρήσεις",
    descriptionTemplate:
      "Βρες τις Καλύτερες Επιχειρήσεις, δες αξιολογήσεις και τιμές. %arcCategoryDesc%",
    size: 200,
    url: `/companies/${category}/${subcategory}`,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { category, subcategory } = params;

  const { categories } = await getData(FREELANCER_CATEGORIES);

  const { categoryBySlug, subcategoryBySlug } = await getData(
    FREELANCER_TAXONOMIES_BY_SLUG,
    {
      category,
      subcategory,
      type: "company",
    }
  );

  const currCategory = categoryBySlug?.data[0]?.attributes;
  const currSubcategory = subcategoryBySlug?.data[0]?.attributes;

  const taxonomies = {
    current: currSubcategory?.label,
    category: currCategory,
    subcategory: currSubcategory,
  };

  const {
    min,
    max,
    pay_m,
    con_t,
    cov_o,
    covc,
    covc_s,
    covc_p,
    covc_ps,
    subc,
    subc_s,
    subc_p,
    subc_ps,
    exp,
    top,
    ver,
    sort,
    page,
  } = searchParams;

  // Utility function to convert a comma-separated string to an array of integers
  const toIntArray = (str) =>
    str ? str.split(",").map((id) => parseInt(id, 10)) : undefined;

  const addFilter = (condition, value) => (condition ? value : undefined);

  const paramsFilters = {
    type: "company",
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    paymentMethods: addFilter(pay_m && pay_m.length > 0, toIntArray(pay_m)),
    contactTypes: addFilter(con_t && con_t.length > 0, toIntArray(con_t)),
    cat: category,
    sub: subcategory,
    experience: addFilter(exp, parseInt(exp, 10)),
    top: addFilter(top === "", true),
    verified: addFilter(ver === "", true),
    coverageOnline: addFilter(cov_o === "", true),
    coverageCounty: addFilter(covc, parseInt(covc, 10)),
    coverageCountyPage: addFilter(covc_p, parseInt(covc_p, 10)),
    coverageCountyPageSize: addFilter(covc_ps, parseInt(covc_ps, 10)),
    subcategoriesPage: addFilter(subc_p, parseInt(subc_p, 10)),
    subcategoriesPageSize: addFilter(subc_ps, parseInt(subc_ps, 10)),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let subcategorySearch = subc_s ? subc_s : undefined;
  let coverageCountySearch = covc_s ? covc_s : undefined;

  const { subcategoriesSearch } = await getData(
    FREELANCER_SUBCATEGORIES_SEARCH_FILTERED,
    {
      type: "company",
      categorySlug: category,
      searchTerm: subcategorySearch,
      subcategoriesPage: paramsFilters.subcategoriesPage,
      subcategoriesPageSize: paramsFilters.subcategoriesPageSize,
    }
  );

  const { counties } = await getData(COUNTIES_SEARCH, {
    name: coverageCountySearch,
    coverageCountyPage: paramsFilters.coverageCountyPage,
    coverageCountyPageSize: paramsFilters.coverageCountyPageSize,
  });

  const selectData = {
    option: ["subc", "covc"],
    search: ["subc_s", "covc_s"],
    page: ["subc_p", "covc_p"],
    pageSize: ["subc_ps", "covc_ps"],
    disabled: "cov_o",
    options: [subcategoriesSearch?.data, counties?.data],
    pagination: [
      subcategoriesSearch?.meta?.pagination,
      counties?.meta?.pagination,
    ],
    rootLabel: ["Όλες οι κατηγορίες", "Όλες οι περιοχές"],
    defaultLabel: [
      `${taxonomies.current ? taxonomies.current : "Όλες οι κατηγορίες"}`,
      "Όλες οι περιοχές",
    ],
  };

  return (
    <>
      <Tabs
        parentPathLabel="Όλες οι κατηγορίες"
        parentPathLink="companies"
        categories={categories?.data}
      />
      <Breadcrumb
        parentPathLabel="Επιχειρήσεις"
        parentPathLink="companies"
        category={currCategory}
        subcategory={currSubcategory}
        plural
      />
      <Banner
        heading={currSubcategory?.plural}
        description={currSubcategory?.description}
        image={currSubcategory?.image?.data?.attributes?.formats?.small?.url}
      />
      <FreelancersArchive
        taxonomies={taxonomies}
        categories={subcategoriesSearch?.data}
        counties={counties?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        selectData={selectData}
        childPath
      />
    </>
  );
}
