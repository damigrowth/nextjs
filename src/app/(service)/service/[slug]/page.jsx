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
import { truncateText } from "@/utils/truncateText";

// Dynamic SEO
export async function generateMetadata({ params }) {
  const serviceSlug = params.slug;
  const { service } = await fetchModel("service", SERVICE(serviceSlug));

  // console.log("META", service[0].attributes.seo);

  if (service === undefined) {
    redirect("/not-found");
  } else {
    const title = service[0].attributes.title;
    const description = truncateText(service[0].attributes.description, 155);

    let metaTitle = "";
    let metaDescription = "";

    if (service[0].attributes.seo !== null) {
      metaTitle = service[0].attributes.seo.metaTitle + " - " + "Doulitsa";
      metaDescription = service[0].attributes.seo.metaDescription;
    } else {
      metaTitle = title + " - " + "Doulitsa";
      metaDescription = description;
    }

    return {
      title: metaTitle,
      description: metaDescription,
    };
  }
}

export default async function page({ params }) {
  const serviceSlug = params.slug;
  const userId = await getUserId();

  const { service } = await fetchModel("service", SERVICE(serviceSlug));

  const serviceId = service[0]?.id;

  if (service === undefined || serviceId === undefined) {
    redirect("/not-found");
  } else {
    // Get the ratings and reviews
    const { ratings } = await fetchModel("ratings", RATINGS);
    const { reviews } = await fetchModel(
      "reviews",
      REVIEWS_BY_SERVICE(serviceId)
    );

    if (serviceId && userId) {
      // Get current views of service based on service id and user id
      const { views } = await fetchModel(
        "views",
        VIEWS_BY_SERVICE_USER(serviceId, userId)
      );

      if (views) {
        // Check if the length of the filtered array is not empty
        if (views.length === 0) {
          const newView = {
            user: userId,
            service: serviceId,
          };

          await postData("views", newView);
        }
      }
    }

    return (
      <>
        <TabSection1 />
        <div className=" bgc-thm3">
          <Breadcumb3 path={["Home", "Services", "Design & Creative"]} />
          <SingleService
            serviceId={serviceId}
            service={service[0].attributes}
            reviews={reviews}
            ratings={ratings}
          />
          <PopulerService />
        </div>
      </>
    );
  }
}
