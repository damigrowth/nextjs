export const CATEGORIES = "categories?fields[0]=title";
export const SKILLS = "skills?fields[0]=title";
export const LOCATIONS =
  "locations/?fields[0]=zipcode&fields[1]=area&fields[2]=county";
export const LOCATIONS_SEARCH = (query) => {
  const url = `locations?fields[0]=zipcode&fields[1]=area&fields[2]=county&filters[area][$contains]=${query}`;
  return url;
};
