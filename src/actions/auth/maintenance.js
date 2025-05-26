import { getData } from '@/lib/client/operations';
import { MAINTENANCE_STATUS } from '@/lib/graphql';

export async function getMaintenanceStatus() {
  const { maintenance } = await getData(MAINTENANCE_STATUS);

  const isUnderMaintenance = maintenance?.data?.attributes?.isActive;

  return { isUnderMaintenance };
}
