import React from "react";
import Contact from "./Contact";
import Breadcrumb from "./Breadcrumb";
import Faq from "./Faq";

export default function ContactContent({ data }) {
  return (
    <>
      <Breadcrumb data={data.breadcrumb} />
      <Contact data={data.contact} />
      <Faq data={data.faq} className={"pt0 pb100"} />
    </>
  );
}
