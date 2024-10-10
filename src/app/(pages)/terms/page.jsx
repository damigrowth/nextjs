import React from "react";
import PageContent from "@/components/ui/Pages/PageContent";
import { data } from "@/data/pages/terms";

export default async function TermsPage() {
  return (
    <PageContent
      title={data.title}
      description={data.description}
      tabs={data.tabs}
    />
  );
}
