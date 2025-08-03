import { VerificationForm } from '@/components/forms/profile';

export default function VerificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Πιστοποίηση</h1>
        <p className="text-muted-foreground">
          Πιστοποιήστε την ταυτότητα και τα στοιχεία σας
        </p>
      </div>
      
      <div className="bg-card rounded-lg p-6">
        <VerificationForm />
      </div>
    </div>
  );
}