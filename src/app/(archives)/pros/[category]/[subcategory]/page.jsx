import FreelancersArchive from "@/components/ui/Archives/Freelancers/FreelancersArchive";
import { getData } from "@/lib/client/operations";
import { COUNTIES_SEARCH } from "@/lib/graphql/queries/main/location";
import { FREELANCER_CATEGORY_SUBCATEGORIES_SEARCH } from "@/lib/graphql/queries/main/taxonomies/freelancer";
import { dynamicMeta } from "@/utils/Seo/Meta/dynamicMeta";

// Dynamic SEO

export async function generateMetadata({ params }) {
  const { subcategory } = params;

  const titleTemplate = "%arcCategoryPlural% - Αναζήτηση για Επαγγελματίες";
  const descriptionTemplate =
    "Βρες τους Καλύτερους Επαγγελματίες, δες αξιολογήσεις και τιμές. %arcCategoryDesc%";
  const descriptionSize = 200;

  const { meta } = await dynamicMeta(
    "freelancerSubcategories",
    {
      type: "freelancer",
    },
    titleTemplate,
    descriptionTemplate,
    descriptionSize,
    true,
    subcategory
  );

  return meta;
}

export default async function page({ params, searchParams }) {
  const { category } = params;

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
    specializations: addFilter(spec && spec.length > 0, toIntArray(spec)),
    experience: addFilter(exp, parseInt(exp, 10)),
    top: addFilter(top, top === "true"),
    coverageOnline: addFilter(cov_o !== undefined, cov_o === "true"),
    coverageCounties: addFilter(cov_c && cov_c.length > 0, toIntArray(cov_c)),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;
  let coverageCountySearch = cov_c_s ? cov_c_s : undefined;

  const { freelancerSubcategories } = await getData(
    FREELANCER_CATEGORY_SUBCATEGORIES_SEARCH,
    {
      type: "freelancer",
      categorySlug: category,
      searchTerm: categorySearch,
    }
  );

  const { counties } = await getData(COUNTIES_SEARCH, {
    name: coverageCountySearch,
  });

  return (
    <>
      <FreelancersArchive
        categories={freelancerSubcategories?.data}
        counties={counties?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        childPath
      />
    </>
  );
}
