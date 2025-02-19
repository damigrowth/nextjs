import { getData } from "@/lib/client/operations";
import { SERVICES_BY_FREELANCER } from "@/lib/graphql/queries/main/service";
import Pagination1 from "@/components/section/Pagination1";
import ManageServiceCard1 from "../card/ManageServiceCard1";

async function getServices(fid, page, pageSize) {
  const { services } = await getData(SERVICES_BY_FREELANCER, {
    id: fid,
    page,
    pageSize,
  });

  return services;
}

export default async function ServicesTableDashboard({ fid, page, pageSize }) {
  const services = await getServices(fid, page, pageSize);

  if (!services?.data?.length) {
    return (
      <div className="text-center p-4">
        <p>Δεν βρέθηκαν υπηρεσίες</p>
        <p className="mt-2 text-muted">
          Προσθέστε την πρώτη σας υπηρεσία πατώντας το κουμπί "Προσθήκη
          Υπηρεσίας"
        </p>
      </div>
    );
  }

  return (
    <div className="packages_table table-responsive">
      <table className="table-style3 table at-savesearch">
        <thead className="t-head">
          <tr>
            <th scope="col">Υπηρεσία</th>
            <th scope="col">Κατηγορία</th>
            <th scope="col">Κατάσταση</th>
            <th scope="col">Επεξεργασία</th>
          </tr>
        </thead>
        <tbody className="t-body">
          {services.data.map((service, i) => {
            if (
              service.attributes?.status?.data &&
              service.attributes.status.data.attributes.type !== "Canceled"
            ) {
              return (
                <ManageServiceCard1 key={service.id || i} service={service} />
              );
            } else {
              return null;
            }
          })}
        </tbody>
      </table>
      <div className="mt30">
        <Pagination1
          pagination={services.meta.pagination}
          paramKey="page"
          itemLabel="Υπηρεσίες"
        />
      </div>
    </div>
  );
}
