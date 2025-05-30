'use server';

import { getData } from '@/lib/client/operations';
import { HOME_SEARCH } from '@/lib/graphql';
import { normalizeTerm } from '@/utils/normalizeTerm';

export async function homeSearch(prevState, formData) {
  try {
    const categoryRaw = formData.get('category');

    const category = categoryRaw ? JSON.parse(categoryRaw) : null;

    const searchTerm = formData.get('searchTerm');

    // Normalize the search term before sending to getData
    // TODO: It needs to search only with the slug because in both it doesn't return the data
    // const normalizedSearchTerm = normalizeGreek(searchTerm);
    const normalizedSearchTerm = normalizeTerm(searchTerm);

    // console.log("Normalized", normalizedSearchTerm);

    const { subcategories, subdivisions } = await getData(HOME_SEARCH, {
      searchTerm: normalizedSearchTerm,
      categorySlug: category || undefined,
    });

    const subcategoriesData = subcategories.data.map((el) => ({
      label: el.attributes.label,
      slug: el.attributes.slug,
      type: 'subcategory',
    }));

    const subdivisionsData = subdivisions.data.map((el) => ({
      label: el.attributes.label,
      slug: el.attributes.slug,
      parentSlug: el.attributes.subcategory.data.attributes.slug,
      type: 'subdivision',
    }));

    // Merge the two arrays, keeping only the subdivision entries for duplicates
    const mergedData = [...subcategoriesData, ...subdivisionsData].reduce(
      (acc, curr) => {
        const existingIndex = acc.findIndex((item) => item.slug === curr.slug);

        if (existingIndex === -1) {
          acc.push(curr);
        } else if (
          acc[existingIndex].type === 'subcategory' &&
          curr.type === 'subdivision'
        ) {
          acc[existingIndex] = curr;
        }

        return acc;
      },
      [],
    );

    const slicedData = mergedData.slice(0, 7);

    return {
      ...prevState,
      errors: null,
      data: slicedData,
    };
  } catch (error) {
    console.error(error);

    return {
      ...prevState,
      errors: error?.message,
      message: 'Server error. Please try again later.',
      data: null,
    };
  }
}
