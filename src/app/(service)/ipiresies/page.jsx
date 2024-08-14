import ServicesArchive from "@/components/ui/Archives/Services/ServicesArchive";
import { getData } from "@/lib/client/operations";
import { CATEGORIES_SEARCH, SERVICES_ARCHIVE } from "@/lib/graphql/queries";
import { staticMeta } from "@/utils/Seo/Meta/staticMeta";

// Static SEO
export async function generateMetadata() {
  const titleTemplate = "Υπηρεσίες | Doulitsa";
  const descriptionTemplate =
    "Ανακαλύψτε τις υπηρεσίες που χρειάζεστε απο τους επαγγελματίες μας.";

  const { meta } = await staticMeta({
    title: titleTemplate,
    description: descriptionTemplate,
    size: 150,
  });

  return meta;
}

export default async function page({ searchParams }) {
  const { search, min, max, time, cat, cat_s, ver, page, sort } = searchParams;

  const addFilter = (condition, value) => (condition ? value : undefined);

  const paramsFilters = {
    search: search || undefined,
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
      <ServicesArchive
        categories={categories?.data}
        searchParams={searchParams}
        paramsFilters={paramsFilters}
      />
    </>
  );
}
