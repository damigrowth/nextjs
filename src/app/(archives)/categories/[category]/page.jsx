import { Banner } from '@/components/banner';
import { BreadcrumbArchives } from '@/components/breadcrumb';
import { TaxonomiesArchive } from '@/components/content';
import { Tabs } from '@/components/section';
import { getData } from '@/lib/client/operations';
import {
  CATEGORIES,
  TAXONOMIES_ARCHIVE_WITH_ACTIVE_SERVICES,
} from '@/lib/graphql';
import { Meta } from '@/utils/Seo/Meta/Meta';

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

export const dynamicParams = true;

/**
 * Generates dynamic SEO metadata for a specific category page.
 * @param {Object} props - The component props.
 * @param {Object} props.params - The parameters from the URL, containing the category slug.
 * @returns {Promise<Object>} The metadata object for the page.
 */
export async function generateMetadata({ params }) {
  const { category } = await params;

  const data = {
    type: 'category',
    params: { category: category, subcategory: '', subdivision: '' },
    titleTemplate: '%arcCategory% - Βρες τις καλύτερες Υπηρεσίες στη Doulitsa',
    descriptionTemplate: '%arcCategoryDesc%',
    size: 100,
    url: `/categories/${category}`,
  };

  const { meta } = await Meta(data);

  return meta;
}

/**
 * Renders the archive page for a specific category.
 * Fetches category-specific data and displays related taxonomies.
 * @param {Object} props - The component props.
 * @param {Object} props.params - The parameters from the URL, containing the category slug.
 * @returns {JSX.Element} The Category archive page component.
 */
export default async function page({ params }) {
  const { category } = await params;

  const { categories } = await getData(CATEGORIES);

  const {
    category: categoryData,
    subcategories,
    subdivisions,
  } = await getData(TAXONOMIES_ARCHIVE_WITH_ACTIVE_SERVICES, {
    category,
  });

  const archive = {
    category: categoryData?.data?.[0]?.attributes,
    subcategories,
    subdivisions,
  };

  const archiveCategory = archive.category;

  return (
    <>
      <Tabs type='categories' categories={categories?.data} />
      <BreadcrumbArchives
        parentPathLabel='Υπηρεσίες'
        parentPathLink='categories'
        category={archiveCategory}
      />
      <Banner
        heading={archiveCategory?.label}
        description={archiveCategory?.description}
        image={archiveCategory?.image?.data?.attributes?.formats?.small?.url}
      />
      <TaxonomiesArchive archive={archive} />
    </>
  );
}
