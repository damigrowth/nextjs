import { NotFoundPage, createNotFoundMetadata } from '@/components/shared/not-found-page';

export const metadata = createNotFoundMetadata(
  '404 - Σελίδα δεν βρέθηκε',
  'Η σελίδα που αναζητάτε δεν βρέθηκε.'
);

export default function ProsNotFound() {
  return (
    <NotFoundPage
      title="Ουπς! Η σελίδα δεν βρέθηκε"
      description="Η σελίδα που αναζητάτε δεν υπάρχει ή έχει αφαιρεθεί."
      primaryButtonText="Δες όλους τους επαγγελματίες"
      primaryButtonHref="/pros"
      backButtonText="Πίσω στην Αρχική"
      backButtonHref="/"
    />
  );
}