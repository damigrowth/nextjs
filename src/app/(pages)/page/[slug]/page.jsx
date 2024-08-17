import Content from "@/components/ui/Pages/Dynamic/Content";
import { getData } from "@/lib/client/operations";
import { GET_PAGE_BY_SLUG } from "@/lib/graphql/queries/main/page";
import React from "react";

export default async function page({ params }) {
  const { slug } = params;

  const { pages } = await getData(GET_PAGE_BY_SLUG, { slug });

  // const data = pages.data[0].attributes;
  // return <Content data={data} />;
  return <div> To be done</div>;
}
