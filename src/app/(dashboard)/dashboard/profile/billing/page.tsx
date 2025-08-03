import { BillingForm } from '@/components/forms/profile';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Στοιχεία Τιμολόγησης</h1>
        <p className="text-muted-foreground">
          Διαχειριστείτε τα στοιχεία τιμολόγησης και πληρωμών
        </p>
      </div>
      
      <div className="bg-card rounded-lg p-6">
        <BillingForm />
      </div>
    </div>
  );
}