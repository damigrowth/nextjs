import { NotFoundPage, createNotFoundMetadata } from '@/components/shared/not-found-page';

export const metadata = createNotFoundMetadata(
  '404 - Κατηγορία δεν βρέθηκε',
  'Η κατηγορία εταιρειών που αναζητάτε δεν βρέθηκε.'
);

export default function CompaniesCategoryNotFound() {
  return (
    <NotFoundPage
      title="Ουπς! Η κατηγορία δεν βρέθηκε"
      description="Η κατηγορία εταιρειών που αναζητάτε δεν υπάρχει ή έχει αφαιρεθεί."
      primaryButtonText="Δες όλες τις εταιρείες"
      primaryButtonHref="/companies"
      backButtonText="Πίσω στην Αρχική"
      backButtonHref="/"
    />
  );
}