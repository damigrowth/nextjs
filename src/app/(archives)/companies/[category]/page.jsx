import Banner from "@/components/ui/Archives/Banner";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import FreelancersArchive from "@/components/ui/Archives/Freelancers/FreelancersArchive";
import Tabs from "@/components/ui/Archives/Tabs";
import { getData } from "@/lib/client/operations";
import { COUNTIES_SEARCH } from "@/lib/graphql/queries/main/location";
import {
  FREELANCER_CATEGORIES,
  FREELANCER_SUBCATEGORIES_SEARCH_FILTERED,
} from "@/lib/graphql/queries/main/taxonomies/freelancer";
import { SKILLS_SEARCH } from "@/lib/graphql/queries/main/taxonomies/freelancer/skill";
import { Meta } from "@/utils/Seo/Meta/Meta";

export const dynamic = "force-dynamic";
export const revalidate = 3600;
export const dynamicParams = true;

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: "Επιχειρήσεις | Doulitsa",
    descriptionTemplate:
      "Βρες τις Καλύτερες Επιχειρήσεις, δες αξιολογήσεις και τιμές.",
    size: 150,
    url: "/companies",
  });

  return meta;
}

export default async function page({ params, searchParams }) {
  const { category } = await params;

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
    subc,
    subc_s,
    subc_p,
    subc_ps,
    skills,
    skills_s,
    skills_p,
    skills_ps,
    exp,
    top,
    ver,
    sort,
    page,
  } = await searchParams;

  const allSearchParams = await searchParams;

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
    skillsPage: addFilter(skills_p, parseInt(skills_p, 10)) || 1,
    skillsPageSize: addFilter(skills_ps, parseInt(skills_ps, 10)) || 10,
    skills: skills?.split(",").filter(Boolean),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let subcategorySearch = subc_s ? subc_s : undefined;
  let coverageCountySearch = covc_s ? covc_s : undefined;
  let skillsSearch = skills_s ? skills_s : undefined;

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

  const { skillsBySearch, skillsBySlug } = await getData(
    SKILLS_SEARCH,
    {
      label: skillsSearch,
      category: category,
      skillsPage: paramsFilters.skillsPage,
      skillsPageSize: paramsFilters.skillsPageSize,
      slugs: paramsFilters.skills,
    },
    "skills"
  );

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

  const multiSelectData = {
    option: "skills",
    search: "skills_s",
    page: "skills_p",
    pageSize: "skills_ps",
    rootLabel: "Όλες οι δεξιότητες",
    defaultLabel: "Όλες οι δεξιότητες",
    // Combine both results and remove duplicates by slug
    options: [
      ...new Map(
        [...(skillsBySearch?.data || []), ...(skillsBySlug?.data || [])].map(
          (item) => [item.attributes.slug, item]
        )
      ).values(),
    ],
    pagination: skillsBySearch?.meta?.pagination,
  };

  return (
    <>
      <Tabs type="company" categories={categories?.data} />
      <Breadcrumb
        parentPathLabel="Επιχειρήσεις"
        parentPathLink="companies"
        category={currCategory}
      />
      <Banner
        heading={currCategory?.label}
        description={currCategory?.description}
        image={currCategory?.image?.data?.attributes?.formats?.small?.url}
      />
      <FreelancersArchive
        taxonomies={taxonomies}
        categories={subcategoriesSearch?.data}
        counties={counties?.data}
        searchParams={allSearchParams}
        paramsFilters={paramsFilters}
        selectData={selectData}
        multiSelectData={multiSelectData}
        childPath
      />
    </>
  );
}
