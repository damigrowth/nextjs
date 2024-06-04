import Breadcumb3 from "@/components/breadcumb/Breadcumb3";
import PopulerService from "@/components/section/PopulerService";
import React from "react";
import TabSection1 from "@/components/section/TabSection1";
import { redirect } from "next/navigation";
import { fetchModel } from "@/lib/models/model";
import {
  RATINGS,
  REVIEWS_BY_SERVICE,
  SERVICE,
  SERVICE_VIEW,
  VIEWS_BY_SERVICE_USER,
} from "@/lib/queries";
import SingleService from "@/components/dashboard/section/SingleService";
import { postData, putData } from "@/lib/api";
import { getUserId } from "@/lib/user/user";

export default async function page({ params }) {
  const serviceId = params.id;
  const userId = await getUserId();

  const { service } = await fetchModel("service", SERVICE(serviceId));

  // console.log("SERVICE", service);

  if (service === undefined) {
    redirect("/not-found");
  }

  // Get current views of service based on service id and user id
  const { views } = await fetchModel(
    "views",
    VIEWS_BY_SERVICE_USER(serviceId, userId)
  );

  // Check if the length of the filtered array is not empty
  if (views.length === 0) {
    const newView = {
      user: userId,
      service: serviceId,
    };

    await postData("views", newView);
  }

  // Get the ratings and reviews
  const { ratings } = await fetchModel("ratings", RATINGS);
  const { reviews } = await fetchModel(
    "reviews",
    REVIEWS_BY_SERVICE(serviceId)
  );

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
