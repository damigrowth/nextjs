import { DocumentsInterface } from '@/components/forms/profile';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Παραστατικά</h1>
        <p className="text-muted-foreground">
          Προβάλετε και διαχειριστείτε τα παραστατικά σας
        </p>
      </div>
      
      <div className="bg-card rounded-lg p-6">
        <DocumentsInterface />
      </div>
    </div>
  );
}