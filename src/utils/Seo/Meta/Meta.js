"use server";

import { redirect } from "next/navigation";
import { fetchEntity } from "./fetchEntity";
import { formatTemplate } from "./formatTemplate";
import { MetaData } from "./MetaData";

export async function Meta({
  type,
  params,
  titleTemplate,
  descriptionTemplate,
  size,
  url,
}) {
  try {
    if (type) {
      const { entity } = await fetchEntity(type, params);

      if (!entity) {
        redirect("/not-found");
      }

      const title = formatTemplate(titleTemplate, entity);

      const description = formatTemplate(descriptionTemplate, entity);

      const image = formatTemplate("%image%", entity);

      const { meta } = await MetaData({
        title,
        description,
        size,
        image,
        url,
      });

      return { meta };
    } else {
      const { meta } = await MetaData({
        title: titleTemplate,
        description: descriptionTemplate,
        size: 150,
        url,
      });

      return { meta };
    }
  } catch (error) {
    console.error("Error fetching entity data:", error);
    redirect("/not-found");
  }
}
