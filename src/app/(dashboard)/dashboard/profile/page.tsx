import { getDashboardMetadata } from '@/lib/seo/pages';

export const metadata = getDashboardMetadata('Διαχείριση');

export default function EditProfilePage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Διαχείριση</h1>
        <p className='text-muted-foreground'>
          Επιλέξτε μία από τις παρακάτω κατηγορίες για να επεξεργαστείτε το
          προφίλ σας
        </p>
      </div>

      <div className='bg-card rounded-lg p-6'>
        <p>
          Καλώς ήρθατε στη διαχείριση του προφίλ σας. Χρησιμοποιήστε το μενού
          στα αριστερά για να πλοηγηθείτε στις διάφορες ενότητες.
        </p>
      </div>
    </div>
  );
}
