import React from "react";
import SearchSelectSingle from "../../Inputs/SearchSelectSingle";

export default function Category({ categories }) {
  const options = categories.map((el) => ({
    value: el.id,
    label: el.attributes.label,
  }));

  return (
    <SearchSelectSingle
      defaultLabel="Όλες οι κατηγορίες"
      paramOptionName="cat"
      paramSearchName="cat_s"
      options={options}
    />
  );
}
