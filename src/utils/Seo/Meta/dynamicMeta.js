"use server";

import { redirect } from "next/navigation";
import { fetchEntity } from "./fetchEntity";
import { formatTemplate } from "./formatTemplate";
import { staticMeta } from "./staticMeta";

export async function dynamicMeta(
  entityType,
  params,
  titleTemplate,
  descriptionTemplate,
  size,
  plural,
  pageParams
) {
  try {
    const { entity } = await fetchEntity(entityType, params, plural);

    if (!entity) {
      redirect("/not-found");
    }

    const title = formatTemplate(titleTemplate, entity, pageParams);

    const description = formatTemplate(descriptionTemplate, entity, pageParams);

    const image = formatTemplate("%image%", entity, pageParams);

    const { meta } = await staticMeta({
      title,
      description,
      size,
      image,
    });

    return { meta };
  } catch (error) {
    console.error("Error fetching entity data:", error);
    redirect("/not-found");
  }
}
