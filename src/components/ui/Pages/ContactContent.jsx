import React from "react";
import Contact from "./Contact";
import Breadcrumb from "./Breadcrumb";

export default function ContactContent({ data }) {
  return (
    <>
      <Breadcrumb data={data.breadcrumb} />
      <Contact data={data.contact} />
    </>
  );
}
