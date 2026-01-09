import { SiteHeader } from '@/components/admin/site-header';
import { getAdminSession } from '@/actions/admin/helpers';
import { AdminCreateServiceForm } from '@/components/admin/forms/admin-create-service-form';
import { getServiceTaxonomies } from '@/lib/taxonomies';
import { tags } from '@/constants/datasets/tags';
import { getAllSubdivisions } from '@/lib/utils/datasets';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Δημιουργία Υπηρεσίας | Admin',
  description: 'Δημιουργήστε μια νέα υπηρεσία και αναθέστε την σε ένα προφίλ',
};

export default async function AdminCreateServicePage() {
  // Verify admin session
  await getAdminSession();

  // Prepare taxonomy data server-side to prevent client-side bundle bloat
  const serviceTaxonomies = getServiceTaxonomies();
  const subdivisions = getAllSubdivisions(serviceTaxonomies);
  const allSubdivisions = subdivisions.map((subdivision) => ({
    id: subdivision.id,
    label: `${subdivision.label}`,
    subdivision: subdivision,
    subcategory: subdivision.subcategory,
    category: subdivision.category,
  }));
  const availableTags = tags.map((tag) => ({
    value: tag.id,
    label: tag.label,
  }));

  return (
    <>
      <SiteHeader title='Δημιουργία Υπηρεσίας' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <AdminCreateServiceForm
            serviceTaxonomies={serviceTaxonomies}
            allSubdivisions={allSubdivisions}
            availableTags={availableTags}
          />
        </div>
      </div>
    </>
  );
}
