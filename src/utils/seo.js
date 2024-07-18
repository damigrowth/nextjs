"use server";

import { getData } from "@/lib/client/operations";
import {
  FREELANCER_SEO_BY_USERNAME,
  SERVICE_SEO_BY_SLUG,
} from "@/lib/graphql/queries";

const { redirect } = require("next/navigation");
const { truncateText } = require("./truncateText");

const ENTITY_QUERIES = {
  service: SERVICE_SEO_BY_SLUG,
  freelancer: FREELANCER_SEO_BY_USERNAME,
};

export async function fetchEntityData(entityType, params) {
  const query = ENTITY_QUERIES[entityType];
  if (!query) throw new Error(`Unsupported entity type: ${entityType}`);

  const data = await getData(query, params);

  const entity = data?.[`${entityType}s`]?.data?.[0]?.attributes;

  const userDisplayName = entity?.user?.data?.attributes?.displayName;

  return { entity, userDisplayName };
}

function getMeta(entity, fallbackTitle, fallbackDescription) {
  const title = entity?.seo?.metaTitle
    ? `${entity.seo.metaTitle} - Doulitsa`
    : `${fallbackTitle} - Doulitsa`;
  const description = entity?.seo?.metaDescription
    ? entity.seo.metaDescription
    : truncateText(fallbackDescription, 155);

  return { title, description };
}

export async function generateMeta(entityType, params) {
  try {
    const { entity, userDisplayName } = await fetchEntityData(
      entityType,
      params
    );

    if (!entity) {
      redirect("/not-found");
    }

    const fallbackTitle = !userDisplayName ? entity.title : userDisplayName;

    const fallbackDescription = entity.description;

    const { title, description } = getMeta(
      entity,
      fallbackTitle,
      fallbackDescription
    );

    return {
      title,
      description,
    };
  } catch (error) {
    console.error("Error fetching entity data:", error);
    redirect("/not-found");
  }
}
