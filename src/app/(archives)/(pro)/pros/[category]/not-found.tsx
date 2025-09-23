import { NotFoundPage, createNotFoundMetadata } from '@/components/shared/not-found-page';

export const metadata = createNotFoundMetadata(
  '404 - Κατηγορία δεν βρέθηκε',
  'Η κατηγορία επαγγελματιών που αναζητάτε δεν βρέθηκε.'
);

export default function ProsCategoryNotFound() {
  return (
    <NotFoundPage
      title="Ουπς! Η κατηγορία δεν βρέθηκε"
      description="Η κατηγορία επαγγελματιών που αναζητάτε δεν υπάρχει ή έχει αφαιρεθεί."
      primaryButtonText="Δες όλους τους επαγγελματίες"
      primaryButtonHref="/pros"
      backButtonText="Πίσω στην Αρχική"
      backButtonHref="/"
    />
  );
}