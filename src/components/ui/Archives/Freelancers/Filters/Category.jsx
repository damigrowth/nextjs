import React from "react";
import SearchSelect from "../../Inputs/SearchSelect";

export default function Category({ selectData }) {
  const options = (selectData.options[0] || []).reduce((acc, cat) => {
    const plural = cat.attributes.plural;
    if (!acc.some((option) => option.label === plural)) {
      acc.push({ value: cat.attributes.slug, label: plural });
    }
    return acc;
  }, []);

  return (
    <SearchSelect
      parentPathLink="profiles"
      options={options}
      rootLabel={selectData.rootLabel[0]}
      defaultLabel={selectData.defaultLabel[0]}
      paramOptionName={selectData.option[0]}
      paramSearchName={selectData.search[0]}
      paramPageName={selectData.page[0]}
      paramPageSizeName={selectData.pageSize[0]}
      pagination={selectData.pagination[0]}
      navigates
    />
  );
}
