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
import { inspect } from "@/utils/inspect";
import { dynamicMeta, Meta } from "@/utils/Seo/Meta/Meta";

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { category } = params;

  const data = {
    type: "freelancerCategory",
    params: { category, type: "freelancer" },
    titleTemplate: "%arcCategoryPlural% - Αναζήτηση για Επαγγελματίες",
    descriptionTemplate:
      "Βρες τους Καλύτερους Επαγγελματίες, δες αξιολογήσεις και τιμές. %arcCategoryDesc%",
    size: 200,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { category, subcategory } = params;

  const { categories } = await getData(FREELANCER_CATEGORIES);

  const { categoryBySlug } = await getData(FREELANCER_TAXONOMIES_BY_SLUG, {
    category,
    type: "freelancer",
  });

  const currCategory = categoryBySlug?.data[0]?.attributes;

  const taxonomies = {
    current: currCategory?.label,
    category: currCategory,
    subcategory: null,
  };

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
    coverageCounties: addFilter(cov_c && cov_c.length > 0, toIntArray(cov_c)),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;
  let coverageCountySearch = cov_c_s ? cov_c_s : undefined;

  const { subcategoriesSearch } = await getData(
    FREELANCER_SUBCATEGORIES_SEARCH,
    {
      type: "freelancer",
      categorySlug: category,
      searchTerm: categorySearch,
    }
  );

  const { counties } = await getData(COUNTIES_SEARCH, {
    name: coverageCountySearch,
  });

  // inspect(freelancerCategories);
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
        category={taxonomies.category}
      />
      <Banner
        heading={taxonomies?.category?.label}
        description={taxonomies?.category?.description}
        image={
          taxonomies?.category?.image?.data?.attributes?.formats?.small?.url
        }
      />
      <FreelancersArchive
        taxonomies={taxonomies}
        categories={subcategoriesSearch?.data}
        counties={counties?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
        childPath
      />
    </>
  );
}
