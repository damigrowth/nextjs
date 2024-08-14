export function getEntityValues(entity, property, pageParams) {
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
