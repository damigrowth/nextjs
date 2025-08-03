'use client';

import { Button } from '@/components/ui/button';

export function VerificationForm() {
  return (
    <form className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Πιστοποίηση</h3>
        <p className="text-sm text-muted-foreground">
          Πιστοποιήστε την ταυτότητα και τα στοιχεία σας
        </p>
      </div>

      {/* Form fields will be added here */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Τα πεδία της φόρμας θα προστεθούν εδώ
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button">
          Ακύρωση
        </Button>
        <Button type="submit">
          Αποθήκευση
        </Button>
      </div>
    </form>
  );
}