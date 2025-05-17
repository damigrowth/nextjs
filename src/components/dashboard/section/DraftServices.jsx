import { getData } from "@/lib/client/operations";
import { DRAFT_SERVICES } from "@/lib/graphql/queries/main/service";
import React from "react";

export default async function DraftServices() {
  const draftServicesData = await getData(DRAFT_SERVICES);
  const count = draftServicesData?.draftServices?.count;

  if (count && count > 0) {
    return (
      <p>
        Υπάρχουν <strong>{count}</strong> υπηρεσίες σε αναμονή για έγκριση.
      </p>
    );
  } else return null;
}
