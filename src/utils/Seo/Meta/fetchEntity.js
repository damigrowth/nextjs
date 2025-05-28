'use server';

import { getData } from '@/lib/client/operations';
import {
  FREELANCER_PAGE_SEO,
  FREELANCERS_ARCHIVE_SEO,
  SERVICE_PAGE_SEO,
  SERVICES_ARCHIVE_SEO,
} from '@/lib/graphql';

const ENTITY_QUERIES = {
  services: SERVICE_PAGE_SEO,
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

  entity = data?.[type]?.data?.[0]?.attributes;

  return { entity };
}
