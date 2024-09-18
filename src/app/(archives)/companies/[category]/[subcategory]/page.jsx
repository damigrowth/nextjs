import Banner from "@/components/ui/Archives/Banner";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import FreelancersArchive from "@/components/ui/Archives/Freelancers/FreelancersArchive";
import Tabs from "@/components/ui/Archives/Tabs";
import { getData } from "@/lib/client/operations";
import { COUNTIES_SEARCH } from "@/lib/graphql/queries/main/location";
import {
  FREELANCER_CATEGORIES,
  FREELANCER_SUBCATEGORIES_SEARCH,
  FREELANCER_TAXONOMIES_BY_SLUG,
} from "@/lib/graphql/queries/main/taxonomies/freelancer";
import { dynamicMeta } from "@/utils/Seo/Meta/dynamicMeta";

// Dynamic SEO
// export async function generateMetadata({ params }) {
//   const { subcategory } = params;

//   const titleTemplate = "%arcCategoryPlural% - Αναζήτηση για Επιχειρήσεις";
//   const descriptionTemplate =
//     "Βρες τις Καλύτερες Επιχειρήσεις, δες αξιολογήσεις και τιμές. %arcCategoryDesc%";
//   const descriptionSize = 200;

//   const { meta } = await dynamicMeta(
//     "freelancerSubcategories",
//     {
//       type: "company",
//     },
//     titleTemplate,
//     descriptionTemplate,
//     descriptionSize,
//     true,
//     subcategory
//   );

//   return meta;
// }

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

  const {
    min,
    max,
    pay_m,
    con_t,
    cov_o,
    cov_c,
    cov_c_s,
    type,
    cat,
    cat_s,
    spec,
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
    specializations: addFilter(spec && spec.length > 0, toIntArray(spec)),
    experience: addFilter(exp, parseInt(exp, 10)),
    top: addFilter(top === "", true),
    verified: addFilter(ver === "", true),
    coverageOnline: addFilter(cov_o === "", true),
    coverageCounties: addFilter(cov_c && cov_c.length > 0, toIntArray(cov_c)),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;
  let coverageCountySearch = cov_c_s ? cov_c_s : undefined;

  const { subcategoriesSearch } = await getData(
    FREELANCER_SUBCATEGORIES_SEARCH,
    {
      type: "company",
      categorySlug: category,
      label: categorySearch,
    }
  );

  const { counties } = await getData(COUNTIES_SEARCH, {
    name: coverageCountySearch,
  });

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
        currCategory={currSubcategory?.label}
        categories={subcategoriesSearch?.data}
        counties={counties?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        childPath
      />
    </>
  );
}
