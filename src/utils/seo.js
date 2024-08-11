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

  return { entity };
}

function getPropertyValue(entity, property) {
  const title = entity.title;
  const displayName =
    entity?.freelancer?.data?.attributes?.user?.data?.attributes?.displayName;
  const category = entity.category?.data?.attributes?.label;
  const description = entity.description;

  switch (property.toLowerCase()) {
    case "title":
      return title || "";
    case "displayname":
      return displayName || "";
    case "category":
      return category || "";
    case "description":
      return description || "";
    default:
      console.log(`Property not found: ${property}`);
      return "";
  }
}

function formatMetaString(template, entity) {
  return template.replace(/%([^%]+)%/g, (match, property) => {
    const value = getPropertyValue(entity, property);
    return value || match;
  });
}

export async function generateMeta(
  entityType,
  params,
  titleTemplate,
  descriptionTemplate
) {
  try {
    const { entity } = await fetchEntityData(entityType, params);

    if (!entity) {
      redirect("/not-found");
    }

    const title = formatMetaString(titleTemplate, entity);
    const description = formatMetaString(descriptionTemplate, entity);

    return {
      title,
      description: truncateText(description, 100),
    };
  } catch (error) {
    console.error("Error fetching entity data:", error);
    redirect("/not-found");
  }
}
