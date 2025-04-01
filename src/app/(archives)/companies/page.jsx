import Banner from "@/components/ui/Archives/Banner";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import FreelancersArchive from "@/components/ui/Archives/Freelancers/FreelancersArchive";
import Tabs from "@/components/ui/Archives/Tabs";
import { getData } from "@/lib/client/operations";
import { COUNTIES_SEARCH } from "@/lib/graphql/queries/main/location";
import {
  FREELANCER_CATEGORIES,
  FREELANCER_CATEGORIES_SEARCH_FILTERED,
  FREELANCER_CATEGORIES_FOR_FILTERED_FREELANCERS
} from "@/lib/graphql/queries/main/taxonomies/freelancer";
import {
  SKILLS_SEARCH,
  SKILLS_FOR_FILTERED_FREELANCERS
} from "@/lib/graphql/queries/main/taxonomies/freelancer/skill";
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
    cat,
    cat_s,
    cat_p,
    cat_ps,
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
    cat: addFilter(cat, cat),
    experience: addFilter(exp, parseInt(exp, 10)),
    top: addFilter(top === "", true),
    verified: addFilter(ver === "", true),
    coverageOnline: addFilter(cov_o === "", true),
    coverageCounty: addFilter(covc, parseInt(covc, 10)),
    coverageCountyPage: addFilter(covc_p, parseInt(covc_p, 10)),
    coverageCountyPageSize: addFilter(covc_ps, parseInt(covc_ps, 10)),
    categoriesPage: addFilter(cat_p, parseInt(cat_p, 10)),
    categoriesPageSize: addFilter(cat_ps, parseInt(cat_ps, 10)),
    skillsPage: addFilter(skills_p, parseInt(skills_p, 10)) || 1,
    skillsPageSize: addFilter(skills_ps, parseInt(skills_ps, 10)) || 10,
    skills: skills?.split(",").filter(Boolean),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;
  let coverageCountySearch = covc_s ? covc_s : undefined;
  let skillsSearch = skills_s ? skills_s : undefined;

  // Fetch categories based on filtered freelancers
  const { categoriesForFilteredResults } = await getData(FREELANCER_CATEGORIES_FOR_FILTERED_FREELANCERS, {
    min: paramsFilters.min,
    max: paramsFilters.max,
    paymentMethods: paramsFilters.paymentMethods,
    contactTypes: paramsFilters.contactTypes,
    coverageOnline: paramsFilters.coverageOnline,
    coverageCounty: paramsFilters.coverageCounty,
    type: paramsFilters.type,
    skills: paramsFilters.skills,
    experience: paramsFilters.experience,
    top: paramsFilters.top,
    verified: paramsFilters.verified,
    categoriesPage: paramsFilters.categoriesPage,
    categoriesPageSize: paramsFilters.categoriesPageSize,
  });

  // Fallback to old query for search functionality only
  const { categoriesSearch } = await getData(FREELANCER_CATEGORIES_SEARCH_FILTERED, {
    searchTerm: categorySearch,
    categoriesPage: paramsFilters.categoriesPage,
    categoriesPageSize: paramsFilters.categoriesPageSize,
  });

  const { counties } = await getData(COUNTIES_SEARCH, {
    name: coverageCountySearch,
    coverageCountyPage: paramsFilters.coverageCountyPage,
    coverageCountyPageSize: paramsFilters.coverageCountyPageSize,
  });

  // Fetch skills based on filtered freelancers
  const { skillsForFilteredResults, skillsBySlug } = await getData(
    SKILLS_FOR_FILTERED_FREELANCERS,
    {
      min: paramsFilters.min,
      max: paramsFilters.max,
      paymentMethods: paramsFilters.paymentMethods,
      contactTypes: paramsFilters.contactTypes,
      coverageOnline: paramsFilters.coverageOnline,
      coverageCounty: paramsFilters.coverageCounty,
      type: paramsFilters.type,
      experience: paramsFilters.experience,
      top: paramsFilters.top,
      verified: paramsFilters.verified,
      label: skillsSearch || "",
      skillsPage: paramsFilters.skillsPage,
      skillsPageSize: paramsFilters.skillsPageSize,
      slugs: paramsFilters.skills || [],
    },
    "skills"
  );

  // Fallback to old query for search functionality only
  const { skillsBySearch: oldSkillsBySearch } = skillsSearch ? 
    await getData(SKILLS_SEARCH, {
      label: skillsSearch,
      skillsPage: paramsFilters.skillsPage,
      skillsPageSize: paramsFilters.skillsPageSize,
      slugs: paramsFilters.skills,
    }, "skills") : { skillsBySearch: { data: [], meta: { pagination: {} } } };

  const selectData = {
    option: ["cat", "covc"],
    search: ["cat_s", "covc_s"],
    page: ["cat_p", "covc_p"],
    pageSize: ["cat_ps", "covc_ps"],
    disabled: "cov_o",
    options: [
      categorySearch ? categoriesSearch?.data : categoriesForFilteredResults?.data, 
      counties?.data
    ],
    pagination: [
      categorySearch ? categoriesSearch?.meta?.pagination : categoriesForFilteredResults?.meta?.pagination,
      counties?.meta?.pagination
    ],
    rootLabel: ["Όλες οι κατηγορίες", "Όλες οι περιοχές"],
    defaultLabel: [
      "Όλες οι κατηγορίες",
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
        [
          ...(skillsSearch ? oldSkillsBySearch?.data || [] : skillsForFilteredResults?.data || []), 
          ...(skillsBySlug?.data || [])
        ].map(
          (item) => [item.attributes.slug, item]
        )
      ).values(),
    ],
    pagination: skillsSearch ? oldSkillsBySearch?.meta?.pagination : skillsForFilteredResults?.meta?.pagination,
  };

  return (
    <>
      <Tabs type="company" categories={categories?.data} />
      <Breadcrumb
        parentPathLabel="Επιχειρήσεις"
        parentPathLink="companies"
      />
      <Banner
        heading="Όλες οι Επιχειρήσεις"
        description="Βρες τις Καλύτερες Επιχειρήσεις, δες αξιολογήσεις και τιμές."
      />
      <FreelancersArchive
        taxonomies={taxonomies}
        categories={categorySearch ? categoriesSearch?.data : categoriesForFilteredResults?.data}
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
