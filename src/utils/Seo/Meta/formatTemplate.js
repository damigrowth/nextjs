import { getEntityValues } from "./getEntityValues";

export function formatTemplate(template, entity, pageParams) {
  return template.replace(/%([^%]+)%/g, (match, property) => {
    const value = getEntityValues(entity, property, pageParams);

    return value;
  });
}
