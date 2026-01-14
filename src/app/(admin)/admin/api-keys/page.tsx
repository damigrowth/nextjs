import { ApiKeyManagement } from '@/components/admin/api-key-management';

export const dynamic = 'force-dynamic';

export default function ApiKeysPage() {
  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6'>
      <div className='px-4 lg:px-6'>
        <ApiKeyManagement />
      </div>
    </div>
  );
}
