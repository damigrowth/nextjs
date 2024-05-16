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
