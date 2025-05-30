import { getBestDimensions } from '@/utils/imageDimensions';

export function getEntityValues(entity, property) {
  const title = entity.title;

  const displayName =
    entity?.displayName || entity?.freelancer?.data?.attributes?.displayName;

  const category = entity.category?.data?.attributes?.label;

  const description = entity.description;

  const type = entity?.type?.data?.attributes?.label;

  const tagline = entity.tagline;

  const singleImage = getBestDimensions(
    entity?.media?.data?.[0]?.attributes?.formats,
  )?.url;

  const arcCategory = entity?.label;

  const arcCategoryPlural = entity?.plural;

  const arcCategoryDesc = entity?.description;

  const arcCategoryImage = getBestDimensions(
    entity?.image?.data?.attributes?.formats,
  )?.url;

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
    case 'arcCategoryDesc':
      return arcCategoryDesc || '';
    case 'image':
      return singleImage || arcCategoryImage || '';
    default:
      return '';
  }
}
