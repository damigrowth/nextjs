import { NotFoundPage, createNotFoundMetadata } from '@/components/shared/not-found-page';

export const metadata = createNotFoundMetadata(
  '404 - Υποκατηγορία δεν βρέθηκε',
  'Η υποκατηγορία εταιρειών που αναζητάτε δεν βρέθηκε.'
);

export default function CompaniesSubcategoryNotFound() {
  return (
    <NotFoundPage
      title="Ουπς! Η υποκατηγορία δεν βρέθηκε"
      description="Η υποκατηγορία εταιρειών που αναζητάτε δεν υπάρχει ή έχει αφαιρεθεί."
      primaryButtonText="Δες όλες τις εταιρείες"
      primaryButtonHref="/companies"
      backButtonText="Πίσω στις κατηγορίες"
      backButtonHref="/companies"
    />
  );
}