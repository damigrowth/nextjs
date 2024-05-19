import { getPublicData } from "../api";
import { MAINTENANCE } from "../queries";

export async function getMaintenanceStatus() {
  const { data } = await getPublicData(MAINTENANCE);
  const isUnderMaintenance = data?.attributes?.isActive;
  return { isUnderMaintenance };
}
