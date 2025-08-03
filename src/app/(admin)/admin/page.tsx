import { ChartAreaInteractive } from '@/components/features/admin/chart-area-interactive';
import { DataTable } from '@/components/features/admin/data-table';
import { SectionCards } from '@/components/features/admin/section-cards';

import data from './data.json';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <SectionCards />
      <div className='px-4 lg:px-6'>
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
}
