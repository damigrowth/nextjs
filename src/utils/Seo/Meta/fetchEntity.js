"use server";

import { getData } from "@/lib/client/operations";
import { FREELANCER_SEO_BY_USERNAME } from "@/lib/graphql/queries/main/freelancer";
import { SERVICE_SEO_BY_SLUG } from "@/lib/graphql/queries/main/service";
import { FREELANCER_CATEGORIES_SEARCH } from "@/lib/graphql/queries/main/taxonomies/freelancer";
import {
  CATEGORIES,
  SUBCATEGORIES,
} from "@/lib/graphql/queries/main/taxonomies/service";

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
