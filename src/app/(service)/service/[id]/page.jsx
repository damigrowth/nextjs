import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import PopulerService from "@/components/section/PopulerService";
import React from "react";
import ServiceDetail3 from "@/components/section/ServiceDetails3";
import TabSection1 from "@/components/section/TabSection1";
import { redirect } from "next/navigation";
import { fetchModel } from "@/lib/models/model";
import { RATINGS, REVIEWS_BY_SERVICE, SERVICE } from "@/lib/queries";
import SingleService from "@/components/dashboard/section/SingleService";

export default async function page({ params }) {
  const serviceId = params.id;

  const { service } = await fetchModel("service", SERVICE(serviceId));
  const { ratings } = await fetchModel("ratings", RATINGS);
  const { reviews } = await fetchModel(
    "reviews",
    REVIEWS_BY_SERVICE(serviceId)
  );

  if (!service) {
    redirect("/not-found");
  }

  return (
    <>
      <TabSection1 />
      <div className=" bgc-thm3">
        <Breadcumb3 path={["Home", "Services", "Design & Creative"]} />
        <SingleService
          serviceId={service.id}
          service={service.attributes}
          reviews={reviews}
          ratings={ratings}
        />
        <PopulerService />
      </div>
    </>
  );
}
