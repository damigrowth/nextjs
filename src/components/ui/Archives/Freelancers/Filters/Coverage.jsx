import React from "react";
import Switch from "../../Inputs/Switch";
import SearchSelectSingle from "../../Inputs/SearchSelectSingle";

export default function Coverage({ counties }) {
  const countiesData = counties.data || [];
  const options = countiesData.map((el) => ({
    value: el.id,
    label: el.attributes.name,
  }));
  return (
    <>
      <Switch paramName="cov_o" label={"Online"} />
      <SearchSelectSingle
        defaultLabel="Όλες οι περιοχές"
        paramOptionName="cov_c"
        paramSearchName="cov_c_s"
        paramPageName="cc_p"
        paramPageSizeName="cc_ps"
        paramDisabledName="cov_o"
        options={options}
        pagination={counties.meta.pagination}
      />
    </>
  );
}
