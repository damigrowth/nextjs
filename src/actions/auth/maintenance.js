import { getData } from '@/lib/client/operations';
import { MAINTENANCE_STATUS } from '@/lib/graphql';

export async function getMaintenanceStatus() {
  // Use NO_CACHE for maintenance status to ensure real-time status
  const { maintenance } = await getData(MAINTENANCE_STATUS, {}, 'NO_CACHE');

  const isUnderMaintenance = maintenance?.data?.attributes?.isActive;

  return { isUnderMaintenance };
}
