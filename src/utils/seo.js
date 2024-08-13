"use server";

import { getData } from "@/lib/client/operations";
import {
  CATEGORIES,
  FREELANCER_CATEGORIES_SEARCH,
  FREELANCER_SEO_BY_USERNAME,
  SERVICE_SEO_BY_SLUG,
  SUBCATEGORIES,
} from "@/lib/graphql/queries";
import { headers } from "next/headers";

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
  const singleImage = entity?.media?.data?.[0]?.attributes?.formats?.small?.url;

  // Find the current entity from the array
  const currentEntity =
    (pageParams && entity.find((el) => el.attributes.slug === pageParams)) ||
    null;

  const arcCategory = currentEntity?.attributes?.label;
  const arcCategoryPlural = currentEntity?.attributes?.plural;
  const arcCategoryDesc = currentEntity?.attributes?.description;
  const arcCategoryImage =
    currentEntity?.attributes?.image?.data?.attributes?.formats?.small?.url;

  switch (property) {
    case "title":
      return title || "";
    case "displayName":
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
    case "image":
      return singleImage || arcCategoryImage || "";
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

export async function assignMetadata({ title, description, size, image }) {
  const headersList = headers();
  const url = headersList.get("x-current-path") || "/";

  const truncatedDescription = truncateText(description, size);
  const fallbackDescription =
    "Ανακάλυψε εξειδικευμένους επαγγελματίες και υπηρεσίες από όλη την Ελλάδα. Από ψηφιακές υπηρεσίες έως τεχνικές εργασίες, έχουμε ό,τι χρειάζεσαι.";

  const fallbackImage =
    "https://res.cloudinary.com/ddejhvzbf/image/upload/v1723560374/doulitsa_92f5bf4005.png";

  const metadata = {
    metadataBase: new URL("https://doulitsa.gr"),
    title,
    description: truncatedDescription || fallbackDescription,
    openGraph: {
      title,
      description: truncatedDescription || fallbackDescription,
      url: `https://doulitsa.gr${url}`,
      siteName: "Doulitsa",
      images: [
        {
          url: !image || image === "" ? fallbackImage : image,
          width: 1600,
          height: 900,
          alt: title,
        },
      ],
      locale: "el_GR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: truncatedDescription || fallbackDescription,
      creator: "@doulitsa",
      images: [
        {
          url: !image || image === "" ? fallbackImage : image,
          width: 1600,
          height: 900,
          alt: title,
        },
      ],
    },
    alternates: {
      canonical: `https://doulitsa.gr${url}`,
      languages: {
        "el-GR": `https://doulitsa.gr${url}`,
      },
    },
  };
  return { metadata };
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

    const image = formatMetaString("%image%", entity, pageParams);

    const { metadata } = await assignMetadata({
      title,
      description,
      size,
      image,
    });

    return metadata;
  } catch (error) {
    console.error("Error fetching entity data:", error);
    redirect("/not-found");
  }
}
