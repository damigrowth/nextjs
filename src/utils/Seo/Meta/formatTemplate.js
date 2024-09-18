import { getEntityValues } from "./getEntityValues";

export function formatTemplate(template, entity) {
  return template.replace(/%([^%]+)%/g, (match, property) => {
    const value = getEntityValues(entity, property);

    return value;
  });
}
