import Terms from "@/components/ui/Pages/Terms";
import { getData } from "@/lib/client/operations";
import { GET_PAGE_BY_SLUG } from "@/lib/graphql/queries/main/page";
import React from "react";

export default async function TermsPage() {
  const { pages: res } = await getData(GET_PAGE_BY_SLUG, {
    slug: "terms",
  });

  const page = res.data[0].attributes;

  return (
    <div>
      <Terms
        title={page?.title}
        description={page.description}
        tabs={page.tabs}
      />
    </div>
  );
}
