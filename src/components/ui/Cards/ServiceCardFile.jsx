import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getBestDimensions } from "@/utils/imageDimensions";

export default function ServiceCardFile({ file, path }) {
  const fallbackImage = "/images/fallback/service.png";

  return (
    <Link href={path}>
      <div className="list-thumb flex-shrink-0 height">
        {!file?.formats && !file?.url && (
          <Image
            height={245}
            width={329}
            className="w-100 h-100 object-fit-cover"
            src={fallbackImage}
            alt="service-thumbnail"
          />
        )}
        {file?.formats && (
          <Image
            height={245}
            width={329}
            className="w-100 h-100 object-fit-cover"
            src={getBestDimensions(file.formats).url}
            alt="service-thumbnail"
          />
        )}
        {file?.url && (
          <video width={329} height={245} controls preload="none">
            <source src={file.url} type="video/mp4" />.
          </video>
        )}
      </div>
    </Link>
  );
}
