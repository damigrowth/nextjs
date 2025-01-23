// ServicesListWrapper.jsx
"use client";

import useHomeStore from "@/store/home/homeStore";
import React from "react";

export default function ServicesListWrapper({ children }) {
  const { featuredCategory } = useHomeStore();

  // Clone and filter children based on category
  const childArray = React.Children.toArray(children);
  const row = childArray[0]; // The row div
  const services = React.Children.toArray(row.props.children);

  const filteredServices = services
    .filter((service) => {
      const serviceCategory = service.props["data-category"];
      return featuredCategory === "" || serviceCategory === featuredCategory;
    })
    .slice(0, 4);

  return <div className="row">{filteredServices}</div>;
}
