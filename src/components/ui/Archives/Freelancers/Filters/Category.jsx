import React from "react";
import SearchSelectSingle from "../../Inputs/SearchSelectSingle";

export default function Category({ currCategory, categories }) {
  const options = categories.reduce((acc, cat) => {
    const plural = cat.attributes.plural;
    if (!acc.some((option) => option.label === plural)) {
      acc.push({ value: cat.attributes.slug, label: plural });
    }
    return acc;
  }, []);

  return (
    <SearchSelectSingle
      rootLabel="Όλες οι κατηγορίες"
      defaultLabel={currCategory ? `${currCategory}` : "Όλες οι κατηγορίες"}
      paramOptionName="cat"
      paramSearchName="cat_s"
      options={options}
      parentPathLink="profiles"
      navigates
    />
  );
}
