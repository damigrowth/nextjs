import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import Breadcumb6 from "@/components/breadcumb/Breadcumb6";

import Listing4 from "@/components/section/Listing4";
import TabSection1 from "@/components/section/TabSection1";
import BannerVid from "@/components/ui/Archives/BannerVid";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import ServicesArchive from "@/components/ui/Archives/Services/ServicesArchive";
import Tabs from "@/components/ui/Archives/Tabs";
import { getData } from "@/lib/client/operations";
import { CATEGORIES_SEARCH, SERVICES_ARCHIVE } from "@/lib/graphql/queries";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | Service 4",
};

export default async function page({ searchParams }) {
  const { min, max, time, cat, cat_s, ver, page, sort } = searchParams;

  const addFilter = (condition, value) => (condition ? value : undefined);

  const paramsFilters = {
    min: addFilter(min, parseInt(min, 10)),
    max: addFilter(max, parseInt(max, 10)),
    time: addFilter(time, parseInt(time, 10)),
    cat: addFilter(cat, parseInt(cat, 10)),
    verified: addFilter(ver, ver === "true"),
    page: !page || parseInt(page, 10) < 1 ? 1 : parseInt(page, 10),
    sort: sort ? sort : "publishedAt:desc",
  };

  let categorySearch = cat_s ? cat_s : undefined;

  const { categories } = await getData(CATEGORIES_SEARCH, {
    label: categorySearch,
  });

  return (
    <>
      <Tabs
        parentPathLabel="Όλες οι κατηγορίες"
        parentPathLink="ipiresies"
        categories={categories?.data}
        searchParams={searchParams}
      />
      <Breadcrumb
        parentPathLabel="Υπηρεσίες"
        parentPathLink="ipiresies"
        categories={categories?.data}
      />
      <BannerVid
        heading="Όλες οι Υπηρεσίες"
        description="Ανακαλύψτε τις υπηρεσίες που χρειάζεστε απο τους επαγγελματίες μας."
      />
      <ServicesArchive
        categories={categories?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
      />
    </>
  );
}
