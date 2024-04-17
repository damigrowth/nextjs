import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import PopulerService from "@/components/section/PopulerService";
import React from "react";
import ServiceDetail2 from "@/components/section/ServiceDetails2";
import ServiceDetail3 from "@/components/section/ServiceDetails3";
import TabSection1 from "@/components/section/TabSection1";
import { getService } from "@/lib/service";
import { redirect } from "next/navigation";

export default async function page({ params }) {
  const serviceId = params.id;

  const service = await getService(serviceId);
  // console.log("Service====>", service);

  if (!service) {
    redirect("/not-found");
  }

  return (
    <>
      <TabSection1 />
      <div className=" bgc-thm3">
        <Breadcumb3 path={["Home", "Services", "Design & Creative"]} />
        <ServiceDetail3 service={service.data.attributes} />
        <PopulerService />
      </div>
    </>
  );
}
