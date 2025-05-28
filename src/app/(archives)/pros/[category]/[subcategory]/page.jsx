import { Banner } from '@/components/banner';
import { BreadcrumbArchives } from '@/components/breadcrumb';
import { FreelancersArchive } from '@/components/content';
import { Tabs } from '@/components/section';
import { getData } from '@/lib/client/operations';
import {
  COUNTIES_SEARCH,
  FREELANCER_CATEGORIES,
  FREELANCER_SUBCATEGORIES_SEARCH_FILTERED,
  FREELANCER_TAXONOMIES_BY_SLUG,
  SKILLS_FOR_FILTERED_FREELANCERS_WITH_CATEGORY,
  SKILLS_SEARCH,
} from '@/lib/graphql';
import { Meta } from '@/utils/Seo/Meta/Meta';

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

export const dynamicParams = true;

// Dynamic SEO
export async function generateMetadata({ params }) {
  const { category, subcategory } = await params;

  const data = {
    type: 'freelancerSubcategory',
    params: { category: '', subcategory, type: 'freelancer' },
    titleTemplate: '%arcCategoryPlural% - Αναζήτηση για Επαγγελματίες',
    descriptionTemplate:
      'Βρες τους Καλύτερους Επαγγελματίες, δες αξιολογήσεις και τιμές. %arcCategoryDesc%',
    size: 200,
    url: `/pros/${category}/${subcategory}`,
  };

  const { meta } = await Meta(data);

  return meta;
}

export default async function page({ params, searchParams }) {
  const { category, subcategory } = await params;

  const { categories } = await getData(FREELANCER_CATEGORIES);

  const { categoryBySlug, subcategoryBySlug } = await getData(
    FREELANCER_TAXONOMIES_BY_SLUG,
    {
      category,
      subcategory,
      type: 'freelancer',
    },
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
    // subc,
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
    str ? str.split(',').map((id) => parseInt(id, 10)) : undefined;

  const addFilter = (condition, value) => (condition ? value : undefined);

  const paramsFilters = {
    type: 'freelancer',
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    paymentMethods: addFilter(pay_m && pay_m.length > 0, toIntArray(pay_m)),
    contactTypes: addFilter(con_t && con_t.length > 0, toIntArray(con_t)),
    cat: category,
    sub: subcategory,
    experience: addFilter(exp, parseInt(exp, 10)),
    top: addFilter(top === '', true),
    verified: addFilter(ver === '', true),
    coverageOnline: addFilter(cov_o === '', true),
    coverageCounty: addFilter(covc, parseInt(covc, 10)),
    coverageCountyPage: addFilter(covc_p, parseInt(covc_p, 10)),
    coverageCountyPageSize: addFilter(covc_ps, parseInt(covc_ps, 10)),
    subcategoriesPage: addFilter(subc_p, parseInt(subc_p, 10)),
    subcategoriesPageSize: addFilter(subc_ps, parseInt(subc_ps, 10)),
    skillsPage: addFilter(skills_p, parseInt(skills_p, 10)) || 1,
    skillsPageSize: addFilter(skills_ps, parseInt(skills_ps, 10)) || 10,
    skills: skills?.split(',').filter(Boolean),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : 'publishedAt:desc',
  };

  let subcategorySearch = subc_s ? subc_s : undefined;

  let coverageCountySearch = covc_s ? covc_s : undefined;

  let skillsSearch = skills_s ? skills_s : undefined;

  const { subcategoriesSearch } = await getData(
    FREELANCER_SUBCATEGORIES_SEARCH_FILTERED,
    {
      type: 'freelancer',
      categorySlug: category,
      searchTerm: subcategorySearch,
      subcategoriesPage: paramsFilters.subcategoriesPage,
      subcategoriesPageSize: paramsFilters.subcategoriesPageSize,
    },
  );

  const { counties } = await getData(COUNTIES_SEARCH, {
    name: coverageCountySearch,
    coverageCountyPage: paramsFilters.coverageCountyPage,
    coverageCountyPageSize: paramsFilters.coverageCountyPageSize,
  });

  // Fetch skills based on filtered freelancers with category filter
  const { skillsForFilteredResults, skillsBySlug } = await getData(
    SKILLS_FOR_FILTERED_FREELANCERS_WITH_CATEGORY,
    {
      min: paramsFilters.min,
      max: paramsFilters.max,
      paymentMethods: paramsFilters.paymentMethods,
      contactTypes: paramsFilters.contactTypes,
      coverageOnline: paramsFilters.coverageOnline,
      coverageCounty: paramsFilters.coverageCounty,
      type: paramsFilters.type,
      cat: category,
      experience: paramsFilters.experience,
      top: paramsFilters.top,
      verified: paramsFilters.verified,
      label: skillsSearch || '',
      skillsPage: paramsFilters.skillsPage,
      skillsPageSize: paramsFilters.skillsPageSize,
      slugs: paramsFilters.skills || [],
    },
    'skills',
  );

  // Fallback to old query for search functionality only
  const { skillsBySearch: oldSkillsBySearch } = skillsSearch
    ? await getData(
        SKILLS_SEARCH,
        {
          label: skillsSearch,
          category: category,
          skillsPage: paramsFilters.skillsPage,
          skillsPageSize: paramsFilters.skillsPageSize,
          slugs: paramsFilters.skills,
        },
        'skills',
      )
    : { skillsBySearch: { data: [], meta: { pagination: {} } } };

  const selectData = {
    option: ['subc', 'covc'],
    search: ['subc_s', 'covc_s'],
    page: ['subc_p', 'covc_p'],
    pageSize: ['subc_ps', 'covc_ps'],
    disabled: 'cov_o',
    options: [subcategoriesSearch?.data, counties?.data],
    pagination: [
      subcategoriesSearch?.meta?.pagination,
      counties?.meta?.pagination,
    ],
    rootLabel: ['Όλες οι κατηγορίες', 'Όλες οι περιοχές'],
    defaultLabel: [
      `${taxonomies.current ? taxonomies.current : 'Όλες οι κατηγορίες'}`,
      'Όλες οι περιοχές',
    ],
  };

  const multiSelectData = {
    option: 'skills',
    search: 'skills_s',
    page: 'skills_p',
    pageSize: 'skills_ps',
    rootLabel: 'Όλες οι δεξιότητες',
    defaultLabel: 'Όλες οι δεξιότητες',
    // Combine both results and remove duplicates by slug
    options: [
      ...new Map(
        [
          ...(skillsSearch
            ? oldSkillsBySearch?.data || []
            : skillsForFilteredResults?.data || []),
          ...(skillsBySlug?.data || []),
        ].map((item) => [item.attributes.slug, item]),
      ).values(),
    ],
    pagination: skillsSearch
      ? oldSkillsBySearch?.meta?.pagination
      : skillsForFilteredResults?.meta?.pagination,
  };

  return (
    <>
      <Tabs type='freelancer' categories={categories?.data} />
      <BreadcrumbArchives
        parentPathLabel='Επαγγελματίες'
        parentPathLink='pros'
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
        searchParams={allSearchParams}
        paramsFilters={paramsFilters}
        selectData={selectData}
        multiSelectData={multiSelectData}
        childPath
      />
    </>
  );
}
