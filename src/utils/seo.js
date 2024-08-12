"use server";

import { getData } from "@/lib/client/operations";
import {
  CATEGORIES,
  FREELANCER_CATEGORIES_SEARCH,
  FREELANCER_SEO_BY_USERNAME,
  SERVICE_SEO_BY_SLUG,
  SUBCATEGORIES,
} from "@/lib/graphql/queries";

const { redirect } = require("next/navigation");
const { truncateText } = require("./truncateText");

const ENTITY_QUERIES = {
  service: SERVICE_SEO_BY_SLUG,
  freelancer: FREELANCER_SEO_BY_USERNAME,
  categories: CATEGORIES,
  subcategories: SUBCATEGORIES,
  freelancerCategories: FREELANCER_CATEGORIES_SEARCH,
};

export async function fetchEntityData(entityType, params, plural) {
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

function getPropertyValue(entity, property, pageParams) {
  const title = entity.title;
  const displayName =
    entity?.freelancer?.data?.attributes?.user?.data?.attributes?.displayName ||
    entity?.user?.data?.attributes?.displayName;
  const category = entity.category?.data?.attributes?.label;
  const description = entity.description;
  const type = entity?.type?.data?.attributes?.label;
  const tagline = entity.tagline;

  // Find the current entity from the array
  const currentEntity = entity.find((el) => el.attributes.slug === pageParams);

  const arcCategory = currentEntity?.attributes?.label;
  const arcCategoryPlural = currentEntity?.attributes?.plural;
  const arcCategoryDesc = currentEntity?.attributes?.description;

  switch (property) {
    case "title":
      return title || "";
    case "displayname":
      return displayName || "";
    case "category":
      return category || "";
    case "description":
      return description || "";
    case "type":
      return type || "";
    case "tagline":
      return tagline || "";
    case "arcCategory":
      return arcCategory || "";
    case "arcCategoryPlural":
      return arcCategoryPlural || "";
    case "arcCategoryDesc":
      return arcCategoryDesc || "";
    default:
      return "";
  }
}

function formatMetaString(template, entity, pageParams) {
  return template.replace(/%([^%]+)%/g, (match, property) => {
    const value = getPropertyValue(entity, property, pageParams);

    return value;
  });
}

export async function generateMeta(
  entityType,
  params,
  titleTemplate,
  descriptionTemplate,
  size,
  plural,
  pageParams
) {
  try {
    const { entity } = await fetchEntityData(entityType, params, plural);

    if (!entity) {
      redirect("/not-found");
    }

    const title = formatMetaString(titleTemplate, entity, pageParams);
    const description = formatMetaString(
      descriptionTemplate,
      entity,
      pageParams
    );

    return {
      title,
      description: truncateText(description, size),
    };
  } catch (error) {
    console.error("Error fetching entity data:", error);
    redirect("/not-found");
  }
}
