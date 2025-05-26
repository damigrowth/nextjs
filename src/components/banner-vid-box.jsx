"use client";

import useArchiveStore from "@/store/archive/archiveStore";
import FsLightbox from "fslightbox-react";
import React from "react";

export default function BannerVidBox() {
  const { bannerVideoToggled } = useArchiveStore();

  return (
    <FsLightbox
      toggler={bannerVideoToggled}
      sources={["https://www.youtube.com/watch?v=7EHnQ0VM4KY"]}
    />
  );
}
