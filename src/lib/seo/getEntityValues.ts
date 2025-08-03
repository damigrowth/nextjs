export function getEntityValues(entity: any, property: string): string {
  const title = entity?.title;
  const displayName =
    entity?.displayName || entity?.freelancer?.data?.attributes?.displayName;
  const category = entity?.category?.data?.attributes?.label;
  const description = entity?.description;
  const type = entity?.type?.data?.attributes?.label;
  const tagline = entity?.tagline;

  const singleImage = null;
  // const singleImage = getImage(entity?.media?.data?.[0], { size: 'banner' });

  const arcCategory = entity?.label;
  const arcCategoryPlural = entity?.plural;
  const arcSubcategoryPlural = entity?.plural;
  const arcCategoryDesc = entity?.description;
  const arcSubcategoryDesc = entity?.description;

  const arcCategoryImage = null;
  // const arcCategoryImage = getImage(entity?.image, { size: 'banner' });

  switch (property) {
    case 'title':
      return title || '';
    case 'displayName':
      return displayName || '';
    case 'category':
      return category || '';
    case 'description':
      return description || '';
    case 'type':
      return type || '';
    case 'tagline':
      return tagline || '';
    case 'arcCategory':
      return arcCategory || '';
    case 'arcCategoryPlural':
      return arcCategoryPlural || '';
    case 'arcSubcategoryPlural':
      return arcSubcategoryPlural || '';
    case 'arcCategoryDesc':
      return arcCategoryDesc || '';
    case 'arcSubcategoryDesc':
      return arcSubcategoryDesc || '';
    case 'image':
      return singleImage || arcCategoryImage || '';
    default:
      return '';
  }
}
