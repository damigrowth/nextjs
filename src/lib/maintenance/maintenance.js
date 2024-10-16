import { getData } from "../client/operations";
import { MAINTENANCE_STATUS } from "../graphql/queries/main/global";

export async function getMaintenanceStatus() {
  const { maintenance } = await getData(MAINTENANCE_STATUS);

  const isUnderMaintenance = maintenance?.data?.attributes?.isActive;
  return { isUnderMaintenance };
}
