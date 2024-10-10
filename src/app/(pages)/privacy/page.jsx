import React from "react";
import PageContent from "@/components/ui/Pages/PageContent";
import { data } from "@/data/pages/pricacy";

export default async function PrivacyPage() {
  return (
    <PageContent
      title={data.title}
      description={data.description}
      tabs={data.tabs}
    />
  );
}
