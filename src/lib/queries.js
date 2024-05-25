export const MAINTENANCE = "maintenance?fields[0]=isActive";
export const CATEGORIES = "categories?fields[0]=title";
export const SKILLS = "skills?fields[0]=title";
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

export const SERVICE = (serviceId) => {
  const url = `services/${serviceId}?populate[freelancer][fields]=*&populate[category][fields][0]=title&populate[area][fields]=name&populate[skills][fields][0]=title&populate[packages][populate][0]=features&populate[addons][fields]=*&populate[faq][fields]=*&populate[media][fields]=formats&populate[status][fields]=type&populate[rating_global][fields]=name&populate[rating_global][fields]=grade`;
  return url;
};

export const REVIEWS_BY_SERVICE = (serviceId) => {
  const url = `reviews?filters[service][id][$eq]=${serviceId}&publicationState=live&populate[user][fields]=displayName&populate[type][fields]=name&populate[status][fields]=type&populate[likes][fields]=id&populate[dislikes][fields]=id`;

  return url;
};
export const REVIEW_REACT = (type, reviewId) => {
  const url = `reviews/${reviewId}/?populate[${type}s][fields]=id&fields=id`;
  return url;
};

export const RATINGS = `ratings?sort[0]=id:desc&fields[0]=name&fields[1]=grade`;

export const RATING_SERVICES_COUNT = (ratingId) => {
  const url = `ratings/${ratingId}?fields[0]=id&populate[services][fields]=id`;
  return url;
};

export const SERVICE_RATING_UPDATE = (serviceId) => {
  const url = `services/${serviceId}?fields[0]=rating&populate[rating_global][fields]=name&populate[rating_global][fields]=grade&populate[rating_global][fields]=id`;
  return url;
};

export const POST_REVIEW = `reviews?populate[status][fields]=type`;
