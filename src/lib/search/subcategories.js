"use server";

import { getData } from "../client/operations";
import { HOME_SEARCH } from "../graphql/queries/main/taxonomies/service";

export async function searchSubcategories(prevState, formData) {
  try {
    const categoryRaw = formData.get("category");
    const category = categoryRaw ? JSON.parse(categoryRaw) : null;

    const searchTerm = formData.get("searchTerm");

    const { homeSearch } = await getData(HOME_SEARCH, {
      searchTerm: searchTerm,
      categorySlug: category || undefined,
    });

    if (homeSearch?.data) {
      const data = homeSearch.data.map((el) => ({
        label: el.attributes.label,
        slug: el.attributes.slug,
        parentSlug: el.attributes.category.data.attributes.slug,
      }));

      const slicedData = data.slice(0, 7);

      return {
        ...prevState,
        errors: null,
        data: slicedData,
      };
    } else {
      return {
        ...prevState,
        errors: "No subcategories found",
        data: null,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      ...prevState,
      errors: error?.message,
      message: "Server error. Please try again later.",
      data: null,
    };
  }
}
