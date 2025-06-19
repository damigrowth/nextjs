import { Banner } from '@/components/banner';
import { BreadcrumbArchives } from '@/components/breadcrumb';
import { TaxonomiesArchive } from '@/components/content';
import { Tabs } from '@/components/section';
import { getPublicData } from '@/lib/client/operations';
import {
  ALL_TAXONOMIES_ARCHIVE_WITH_ACTIVE_SERVICES,
  CATEGORIES,
} from '@/lib/graphql';
import { Meta } from '@/utils/Seo/Meta/Meta';

export const dynamic = 'force-static';
export const revalidate = false;

/**
 * Generates static SEO metadata for the categories page.
 * @returns {Promise<Object>} The metadata object for the page.
 */
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate: 'Κατηγορίες | Doulitsa',
    descriptionTemplate:
      'Ανακάλυψε τις κατηγορίες υπηρεσιών που χρειάζεσαι απο τους επαγγελματίες μας.',
    size: 150,
    url: '/categories',
  });

  return meta;
}

/**
 * Renders the Categories archive page.
 * This page is STATIC (no searchParams) for optimal performance
 */
export default async function page() {
  // No searchParams usage - enables static generation
  const { categories } = await getPublicData(CATEGORIES);

  const {
    categories: archiveCategories,
    subcategories,
    subdivisions,
  } = await getPublicData(ALL_TAXONOMIES_ARCHIVE_WITH_ACTIVE_SERVICES);

  const categoriesWithFilteredSubcategories =
    archiveCategories?.data
      ?.filter((category) => category.attributes.subcategories.data.length > 0)
      ?.map((category) => ({
        ...category.attributes,
        subdivisions: {
          data: category.attributes.subcategories.data,
        },
      })) || [];

  const archive = {
    categories: categoriesWithFilteredSubcategories,
    subdivisions,
  };

  return (
    <>
      <Tabs type='categories' categories={categories?.data} />
      <BreadcrumbArchives
        parentPathLabel='Κατηγορίες'
        parentPathLink='categories'
      />
      <Banner
        heading='Όλες οι Κατηγορίες'
        description='Ανακάλυψε όλες τις υπηρεσίες για κάθε ανάγκη από τους καλύτερους επαγγελματίες.'
      />
      <TaxonomiesArchive archive={archive} />
    </>
  );
}
