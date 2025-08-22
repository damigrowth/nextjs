import { BasicInfoForm } from '@/components';

export default function BasicPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Βασικά στοιχεία</h1>
        <p className='text-muted-foreground'>
          Επεξεργαστείτε τα βασικά στοιχεία του προφίλ σας
        </p>
      </div>
      <BasicInfoForm />
    </div>
  );
}
