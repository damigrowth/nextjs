import DashboardLayout from '@/components/layout/layout-dashboard';
import { MobileNavigation2 } from '@/components/navigation';
import { InvoiceInfo } from '@/components/section';

export const metadata = {
  title: 'Doulitsa - Freelance Marketplace React/Next Js Template | Invoice',
};

export default function page() {
  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        <InvoiceInfo />
      </DashboardLayout>
    </>
  );
}
