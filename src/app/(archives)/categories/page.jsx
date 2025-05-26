import { Banner } from '@/components/banner';
import { BreadcrumbArchives } from '@/components/breadcrumb';
import { TaxonomiesArchive } from '@/components/content';
import { Tabs } from '@/components/section';
import { getData } from '@/lib/client/operations';
import {
  ALL_TAXONOMIES_ARCHIVE_WITH_ACTIVE_SERVICES,
  CATEGORIES,
} from '@/lib/graphql';
import { Meta } from '@/utils/Seo/Meta/Meta';

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

// Static SEO
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

export default async function page() {
  const { categories } = await getData(CATEGORIES);

  const {
    categories: archiveCategories,
    subcategories,
    subdivisions,
  } = await getData(ALL_TAXONOMIES_ARCHIVE_WITH_ACTIVE_SERVICES);

  // Δημιουργία του archive αντικειμένου για το TaxonomiesArchive component
  const archive = {
    subcategories,
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
