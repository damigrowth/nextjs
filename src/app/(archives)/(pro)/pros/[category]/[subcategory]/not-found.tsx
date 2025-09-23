import { NotFoundPage, createNotFoundMetadata } from '@/components/shared/not-found-page';

export const metadata = createNotFoundMetadata(
  '404 - Υποκατηγορία δεν βρέθηκε',
  'Η υποκατηγορία επαγγελματιών που αναζητάτε δεν βρέθηκε.'
);

export default function ProsSubcategoryNotFound() {
  return (
    <NotFoundPage
      title="Ουπς! Η υποκατηγορία δεν βρέθηκε"
      description="Η υποκατηγορία επαγγελματιών που αναζητάτε δεν υπάρχει ή έχει αφαιρεθεί."
      primaryButtonText="Δες όλους τους επαγγελματίες"
      primaryButtonHref="/pros"
      backButtonText="Πίσω στις κατηγορίες"
      backButtonHref="/pros"
    />
  );
}