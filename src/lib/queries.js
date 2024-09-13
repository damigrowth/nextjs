export const MAINTENANCE = "maintenance?fields[0]=isActive";

export const CATEGORIES = "categories?fields[0]=label";

export const SKILLS = "skills?fields[0]=label";

export const TAGS = "tags?fields[0]=label";

export const TAGS_SEARCH = (query) => {
  const url = `tags?fields[0]=label&fields[1]=slug&filters[label][$contains]=${query}`;
  return url;
};
export const LOCATIONS =
  "locations/?fields[0]=zipcode&fields[1]=area&fields[2]=county";

export const LOCATIONS_SEARCH = (query) => {
  const url = `locations?fields[0]=zipcode&fields[1]=area&fields[2]=county&filters[area][$contains]=${query}`;
  return url;
};

export const ZIPCODE = (zipcode) => {
  const url = `zipcodes?fields[0]=name&filters[name][$eq]=${zipcode}`;
  return url;
};

export const AREAS = `areas?fields[0]=name&sort[0]=name:asc`;

export const AREA = (area) => {
  const url = `areas?fields[0]=name&filters[name][$eq]=${area}`;
  return url;
};

export const SUBCATEGORY = (subcategory) => {
  const url = `subcategories?fields[0]=label&filters[label][$eq]=${subcategory}`;
  return url;
};

export const COUNTY_SEARCH = (county) => {
  const url = `counties?fields[0]=name&filters[name][$contains]=${county}&sort[0]=name:asc`;
  return url;
};

export const AREAS_BY_COUNTY = (countyId) => {
  let url = ``;
  if (countyId) {
    url = `counties/${countyId}/?fields[0]=name&populate[areas][fields][0]=name&sort[0]=name:asc`;
  } else {
    url = `areas?fields[0]=name&sort[0]=name:asc`;
  }
  return url;
};

export const ZIPCODES_BY_AREA = (areaId) => {
  const url = `areas/${areaId}/?fields[0]=name&populate[zipcodes][fields][0]=name`;
  return url;
};

export const REVIEW = (reviewId) => {
  const url = `reviews/${reviewId}/?populate[user][fields]=id&populate[type][fields]=name&populate[status][fields]=type&populate[service][fields]=id&populate[likes][fields]=id&fields[0]=comment&fields[1]=rating`;
};

const serviceFragments = {
  base: "services?filters[slug][$eq]=",
  freelancer:
    "populate[freelancer][fields][0]=firstName&populate[freelancer][fields][1]=lastName&populate[freelancer][fields][2]=displayName&populate[freelancer][populate][image][fields]=*&populate[freelancer][populate][user][fields]=verified",
  category: "populate[category][fields][0]=label",
  area: "populate[area][fields]=name",
  skills: "populate[skills][fields][0]=label",
  packages: "populate[packages][populate][0]=features",
  addons: "populate[addons][fields]=*",
  faq: "populate[faq][fields]=*",
  media: "populate[media][fields]=formats",
  status: "populate[status][fields]=type",
  rating_global:
    "populate[rating_global][fields]=name&populate[rating_global][fields]=grade",
  views: "populate[views][populate][user][fields]=id",
  tags: "populate[tags][fields]=label&populate[tags][fields]=slug",
  seo: "populate[seo]=*",
};

export const SERVICE = (serviceSlug) => {
  const url = `${serviceFragments.base}${serviceSlug}&${serviceFragments.freelancer}&${serviceFragments.category}&${serviceFragments.area}&${serviceFragments.skills}&${serviceFragments.packages}&${serviceFragments.addons}&${serviceFragments.faq}&${serviceFragments.media}&${serviceFragments.status}&${serviceFragments.rating_global}&${serviceFragments.views}&${serviceFragments.tags}&${serviceFragments.seo}`;
  return url;
};

export const FREELANCER = (freelancerSlug) => {
  const url = ``;
  return url;
};

export const SOCIALS =
  "?populate[0]=socials.facebook&populate[1]=socials.linkedin&populate[2]=socials.x&populate[3]=socials.youtube&populate[4]=socials.github&populate[5]=socials.instagram&populate[6]=socials.behance&populate[7]=socials.dribbble";

export const REVIEWS_BY_SERVICE = (serviceId) => {
  const url = `reviews?filters[service][id][$eq]=${serviceId}&publicationState=live&populate[user][fields]=displayName&populate[user][fields]=firstName&populate[user][fields]=lastName&populate[user][populate][0]=image&populate[type][fields]=name&populate[status][fields]=type&populate[likes][fields]=id&populate[dislikes][fields]=id`;

  return url;
};
export const REVIEW_REACT = (type, reviewId) => {
  const url = `reviews/${reviewId}/?populate[${type}s][fields]=id&fields=id`;
  return url;
};

export const RATINGS = `ratings?sort[0]=id:desc&fields[0]=label&fields[1]=grade`;

export const RATING_SERVICES_COUNT = (ratingId) => {
  const url = `ratings/${ratingId}?fields[0]=id&populate[services][fields]=id`;
  return url;
};

export const SERVICE_RATING_UPDATE = (serviceId) => {
  const url = `services/${serviceId}?fields[0]=rating&populate[rating_global][fields]=name&populate[rating_global][fields]=grade&populate[rating_global][fields]=id`;
  return url;
};

export const POST_REVIEW = `reviews?populate[status][fields]=type`;

export const SERVICE_VIEW = (serviceId) => {
  const url = `services/${serviceId}?fields[0]=views`;
  return url;
};

export const VIEWS_BY_SERVICE_USER = (serviceId, userId) => {
  const url = `views?filters[service][id][$eq]=${serviceId}&filters[user][id][$eq]=${userId}`;
  return url;
};
