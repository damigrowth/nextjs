import Banner from "@/components/ui/Archives/Banner";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import FreelancersArchive from "@/components/ui/Archives/Freelancers/FreelancersArchive";
import Tabs from "@/components/ui/Archives/Tabs";
import { getData } from "@/lib/client/operations";
import { COUNTIES_SEARCH } from "@/lib/graphql/queries/main/location";
import {
  FREELANCER_CATEGORIES,
  FREELANCER_CATEGORIES_SEARCH_FILTERED,
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
    cat: category,
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
        plural
      />
      <Banner
        heading="Ανακάλυψε Επιχειρήσεις"
        description="Εντόπισε την επιχείρηση που χρειάζεσαι. Βρες τις καλύτερες επιχειρήσεις"
      />
      <FreelancersArchive
        taxonomies={taxonomies}
        categories={categoriesSearch?.data}
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
