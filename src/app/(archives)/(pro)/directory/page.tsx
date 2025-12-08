import { getDirectoryPageData } from '@/actions/profiles/get-directory';
import { TaxonomyTabs } from '@/components/shared';
import { ArchiveBanner } from '@/components/archives/archive-banner';
import { SubdivisionsCarousel } from '@/components/archives/subdivisions-carousel';
import { CategoriesGrid } from '@/components/archives/categories-grid';
import { getDirectoryMetadata } from '@/lib/seo/pages';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

export async function generateMetadata() {
  return getDirectoryMetadata();
}

export async function generateStaticParams() {
  return [];
}

export default async function DirectoryPage() {
  try {
    const directoryDataResult = await getDirectoryPageData();

    if (!directoryDataResult.success) {
      throw new Error(
        directoryDataResult.error || 'Failed to fetch directory data',
      );
    }

    const { popularSubcategories, categories } = directoryDataResult.data;

    // Transform categories for TaxonomyTabs
    const proCategories = categories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      slug: cat.slug,
    }));

    return (
      <div className='py-20 bg-silver'>
        {/* Pro Category Navigation Tabs */}
        <TaxonomyTabs
          items={proCategories}
          basePath='dir'
          allItemsLabel='Επαγγελματικός Κατάλογος'
          allItemsHref='/directory'
          activeItemSlug={undefined}
          usePluralLabels={true}
        />

        {/* Archive Banner */}
        <ArchiveBanner
          title='Επαγγελματικός Κατάλογος'
          subtitle='Ανακάλυψε όλες τις κατηγορίες με επαγγελματίες και επιχειρήσεις για κάθε ανάγκη.'
        />

        {/* Page Content */}
        <section>
          <div className='container mx-auto px-4'>
            <div className='mt-6 mb-16 space-y-10'>
              {/* Popular Pro Subcategories Carousel */}
              <SubdivisionsCarousel
                subdivisions={popularSubcategories}
                gradientColor='silver'
              />

              {/* Categories Grid */}
              <CategoriesGrid categories={categories} />
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Directory page error:', error);
    throw error;
  }
}
