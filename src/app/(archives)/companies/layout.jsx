import Tabs from "@/components/ui/Archives/Tabs";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Banner from "@/components/ui/Archives/Banner";
import { getData } from "@/lib/client/operations";
import { FREELANCER_CATEGORIES_SEARCH } from "@/lib/graphql/queries";
import React from "react";

export default async function layout({ children }) {
  const { freelancerCategories } = await getData(FREELANCER_CATEGORIES_SEARCH, {
    type: "company",
  });

  return (
    <>
      <Tabs
        parentPathLabel="Όλες οι κατηγορίες"
        parentPathLink="companies"
        categories={freelancerCategories?.data}
        plural
      />
      <Breadcrumb
        parentPathLabel="Επιχειρήσεις"
        parentPathLink="companies"
        categories={freelancerCategories?.data}
        plural
      />
      <Banner
        categories={freelancerCategories?.data}
        heading="Βρείτε Επιχειρήσεις"
        description="Ανακαλύψτε και προσλάβετε τις καλύτερες επιχειρήσεις"
      />
      {children}
    </>
  );
}
