"use server";

import { getData } from "@/lib/client/operations";
import {
  CATEGORIES,
  FREELANCER_CATEGORIES_SEARCH,
  FREELANCER_SEO_BY_USERNAME,
  SERVICE_SEO_BY_SLUG,
  SUBCATEGORIES,
} from "@/lib/graphql/queries";

const ENTITY_QUERIES = {
  service: SERVICE_SEO_BY_SLUG,
  freelancer: FREELANCER_SEO_BY_USERNAME,
  categories: CATEGORIES,
  subcategories: SUBCATEGORIES,
  freelancerCategories: FREELANCER_CATEGORIES_SEARCH,
};

export async function fetchEntity(entityType, params, plural) {
  const query = ENTITY_QUERIES[entityType];
  if (!query) throw new Error(`Unsupported entity type: ${entityType}`);

  const data = await getData(query, params);

  let entity = null;

  if (plural) {
    entity = data?.[entityType]?.data;
  } else {
    entity = data?.[`${entityType}s`]?.data?.[0]?.attributes;
  }

  return { entity };
}
