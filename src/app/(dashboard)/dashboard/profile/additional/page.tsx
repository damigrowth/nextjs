import { AdditionalInfoForm } from '@/components/forms/profile';

export default function AdditionalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Πρόσθετα Στοιχεία</h1>
        <p className="text-muted-foreground">
          Προσθέστε επιπλέον πληροφορίες στο προφίλ σας
        </p>
      </div>
      
      <div className="bg-card rounded-lg p-6">
        <AdditionalInfoForm />
      </div>
    </div>
  );
}