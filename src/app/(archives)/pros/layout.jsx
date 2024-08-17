import Tabs from "@/components/ui/Archives/Tabs";
import Breadcrumb from "@/components/ui/Archives/Breadcrumb";
import Banner from "@/components/ui/Archives/Banner";
import { getData } from "@/lib/client/operations";
import React from "react";
import { FREELANCER_CATEGORIES_SEARCH } from "@/lib/graphql/queries/main/taxonomies/freelancer";

export default async function layout({ children }) {
  const { freelancerCategories } = await getData(FREELANCER_CATEGORIES_SEARCH, {
    type: "freelancer",
  });

  return (
    <>
      <Tabs
        parentPathLabel="Όλες οι κατηγορίες"
        parentPathLink="pros"
        categories={freelancerCategories?.data}
        plural
      />
      <Breadcrumb
        parentPathLabel="Επαγγελματίες"
        parentPathLink="pros"
        categories={freelancerCategories?.data}
        plural
      />
      <Banner
        categories={freelancerCategories?.data}
        heading="Βρείτε Επαγγελματίες"
        description="Ανακαλύψτε και προσλάβετε τους καλύτερους επαγγελματίες για οποιαδήποτε ανάγκη."
      />
      {children}
    </>
  );
}
