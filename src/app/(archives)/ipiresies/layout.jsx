import Banner from "@/components/ui/Archives/Banner";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Tabs from "@/components/ui/Archives/Tabs";
import { getData } from "@/lib/client/operations";
import { CATEGORIES } from "@/lib/graphql/queries/main/taxonomies/service";
import React from "react";

export default async function layout({ children }) {
  const { categories } = await getData(CATEGORIES);
  return (
    <>
      <Tabs
        parentPathLabel="Όλες οι κατηγορίες"
        parentPathLink="ipiresies"
        categories={categories?.data}
      />
      <Breadcrumb
        parentPathLabel="Υπηρεσίες"
        parentPathLink="ipiresies"
        categories={categories?.data}
      />
      <Banner
        categories={categories?.data}
        heading="Όλες οι Υπηρεσίες"
        description="Ανακαλύψτε τις υπηρεσίες που χρειάζεστε απο τους επαγγελματίες μας."
      />
      {children}
    </>
  );
}
