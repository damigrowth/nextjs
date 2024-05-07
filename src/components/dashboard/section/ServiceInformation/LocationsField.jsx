"use client";

import { fetchModel } from "@/lib/models/model";
import { LOCATIONS_SEARCH } from "@/lib/queries";
import React, { useEffect, useState } from "react";
import SelectInputSingle from "../../option/SelectInputSearch";
import { STRAPI_TOKEN, STRAPI_URL } from "@/lib/strapi";

export default function LocationsField() {
  const [searchQuery, setSearchQuery] = useState("Αθήνα");
  const [locations, setLocations] = useState([]);

  console.log(locations);

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: `${location.attributes.area}, ${location.attributes.county} ${location.attributes.zipcode}`,
  }));

  return (
    <div className="col-sm-6">
      <div className="mb20">
        <SelectInputSingle
          type="object"
          id="service-location"
          name="service-location"
          label="Περιοχή"
          //   errors={errors}
          isSearchable={true}
          options={locationOptions}
          // value={locationOptions}
          // onSelect={({ id, title }) => setInfo("category", { id, title })}
        />
      </div>
    </div>
  );
}
