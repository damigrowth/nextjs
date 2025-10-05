import { redirect } from 'next/navigation';
import { getService } from '@/actions/admin/services';
import { ServiceDetailView } from '@/components/admin/service-detail-view';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface ServiceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { id } = await params;
  const serviceId = parseInt(id);

  if (isNaN(serviceId)) {
    redirect('/admin/services');
  }

  const result = await getService(serviceId);

  if (!result.success || !result.data) {
    redirect('/admin/services');
  }

  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='px-4 lg:px-6'>
        <ServiceDetailView service={result.data} />
      </div>
    </div>
  );
}
