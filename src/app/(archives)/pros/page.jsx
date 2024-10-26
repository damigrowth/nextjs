import Banner from "@/components/ui/Archives/Banner";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import FreelancersArchive from "@/components/ui/Archives/Freelancers/FreelancersArchive";
import Tabs from "@/components/ui/Archives/Tabs";
import { getData } from "@/lib/client/operations";
import { COUNTIES_SEARCH } from "@/lib/graphql/queries/main/location";
import {
  FREELANCER_CATEGORIES,
  FREELANCER_CATEGORIES_SEARCH,
  FREELANCER_CATEGORIES_SEARCH_FILTERED,
} from "@/lib/graphql/queries/main/taxonomies/freelancer";
import { Meta } from "@/utils/Seo/Meta/Meta";

export const revalidate = 3600;

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: "Επαγγελματίες | Doulitsa",
    descriptionTemplate:
      "Βρες τους Καλύτερους Επαγγελματίες, δες αξιολογήσεις και τιμές.",
    size: 150,
    url: "/pros",
  });

  return meta;
}

export default async function page({ params, searchParams }) {
  const { category, subcategory } = params;

  const { categories } = await getData(FREELANCER_CATEGORIES);

  const taxonomies = {
    current: null,
    category: null,
    subcategory: null,
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
    cat,
    cat_s,
    cat_p,
    cat_ps,
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
    type: "freelancer",
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
    categoriesPage: addFilter(cat_p, parseInt(cat_p, 10)),
    categoriesPageSize: addFilter(cat_ps, parseInt(cat_ps, 10)),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;
  let coverageCountySearch = covc_s ? covc_s : undefined;

  const { categoriesSearch } = await getData(
    FREELANCER_CATEGORIES_SEARCH_FILTERED,
    {
      searchTerm: categorySearch,
      categoriesPage: paramsFilters.categoriesPage,
      categoriesPageSize: paramsFilters.categoriesPageSize,
    }
  );

  const { counties } = await getData(COUNTIES_SEARCH, {
    name: coverageCountySearch,
    coverageCountyPage: paramsFilters.coverageCountyPage,
    coverageCountyPageSize: paramsFilters.coverageCountyPageSize,
  });

  const selectData = {
    option: ["cat", "covc"],
    search: ["cat_s", "covc_s"],
    page: ["cat_p", "covc_p"],
    pageSize: ["cat_ps", "covc_ps"],
    disabled: "cov_o",
    options: [categoriesSearch?.data, counties?.data],
    pagination: [
      categoriesSearch?.meta?.pagination,
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
        parentPathLink="pros"
        categories={categories?.data}
      />
      <Breadcrumb
        parentPathLabel="Επαγγελματίες"
        parentPathLink="pros"
        plural
      />
      <Banner
        heading="Βρείτε Επαγγελματίες"
        description="Ανακαλύψτε και προσλάβετε τους καλύτερους επαγγελματίες για οποιαδήποτε ανάγκη."
      />
      <FreelancersArchive
        taxonomies={taxonomies}
        categories={categoriesSearch?.data}
        counties={counties}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        selectData={selectData}
        childPath
      />
    </>
  );
}
