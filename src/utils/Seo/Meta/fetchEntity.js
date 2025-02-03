"use server";

import { getData } from "@/lib/client/operations";
import { FREELANCER_PAGE_SEO } from "@/lib/graphql/queries/main/freelancer";
import { SERVICE_PAGE_SEO } from "@/lib/graphql/queries/main/service";
import { FREELANCERS_ARCHIVE_SEO } from "@/lib/graphql/queries/main/taxonomies/freelancer";
import { SERVICES_ARCHIVE_SEO } from "@/lib/graphql/queries/main/taxonomies/service";

const ENTITY_QUERIES = {
  service: SERVICE_PAGE_SEO,
  freelancer: FREELANCER_PAGE_SEO,
  category: SERVICES_ARCHIVE_SEO,
  subcategory: SERVICES_ARCHIVE_SEO,
  subdivision: SERVICES_ARCHIVE_SEO,
  freelancerCategory: FREELANCERS_ARCHIVE_SEO,
  freelancerSubcategory: FREELANCERS_ARCHIVE_SEO,
};

export async function fetchEntity(type, params) {
  const query = ENTITY_QUERIES[type];
  if (!query) throw new Error(`Unsupported entity type: ${type}`);

  const data = await getData(query, params);

  let entity = null;

  if (type === "service") {
    entity = data?.[type]?.data?.attributes;
  } else {
    entity = data?.[type]?.data?.[0]?.attributes;
  }

  return { entity };
}
