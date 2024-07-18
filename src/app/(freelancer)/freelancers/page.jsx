import Breadcumb16 from "@/components/breadcumb/Breadcumb16";
import Breadcumb3 from "@/components/breadcumb/Breadcumb3";

import Listing14 from "@/components/section/Listing14";
import TabSection1 from "@/components/section/TabSection1";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import FreelancerGridSkeleton from "@/components/ui/Archives/Freelancers/FreelancerGridSkeleton";
import FreelancersArchive from "@/components/ui/Archives/Freelancers/FreelancersArchive";
import Tabs from "@/components/ui/Archives/Tabs";
import { getData } from "@/lib/client/operations";
import {
  COUNTIES_SEARCH,
  FREELANCER_CATEGORIES_SEARCH,
  FREELANCERS_ARCHIVE,
} from "@/lib/graphql/queries";
import { inspect } from "@/utils/inspect";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Freelancer 2",
};

export default async function page({ searchParams }) {
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
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    paymentMethods: addFilter(pay_m && pay_m.length > 0, toIntArray(pay_m)),
    contactTypes: addFilter(con_t && con_t.length > 0, toIntArray(con_t)),
    type: addFilter(type, parseInt(type, 10)),
    cat: addFilter(cat, parseInt(cat, 10)),
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

  const { freelancerCategories } = await getData(FREELANCER_CATEGORIES_SEARCH, {
    label: categorySearch,
  });

  const { counties } = await getData(COUNTIES_SEARCH, {
    name: coverageCountySearch,
  });

  return (
    <>
      <Tabs
        categories={freelancerCategories?.data}
        category={paramsFilters?.cat}
        paramName="cat"
        heading="Όλες οι κατηγορίες"
        plural
      />
      <Breadcrumb
        heading="Επαγγελματίες"
        category={paramsFilters?.cat}
        categories={freelancerCategories?.data}
        paramName="cat"
        plural
      />
      <Breadcumb16 />
      <FreelancersArchive
        categories={freelancerCategories?.data}
        counties={counties?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
      />
    </>
  );
}
