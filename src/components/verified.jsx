import React from "react";
import Switch from "./switch";

export default function Verified() {
  return (
    <Switch
      paramName="ver"
      label={"Πιστοποιημένα Προφίλ"}
      noHeader
      id="verified-profile-switch"
    />
  );
}
