"use server";

import { truncateText } from "@/utils/truncateText";
import { headers } from "next/headers";

export async function staticMeta({ title, description, size, image }) {
  const headersList = headers();
  const url = headersList.get("x-current-path") || "/";

  const truncatedDescription = truncateText(description, size);
  const fallbackDescription =
    "Ανακάλυψε εξειδικευμένους επαγγελματίες και υπηρεσίες από όλη την Ελλάδα. Από ψηφιακές υπηρεσίες έως τεχνικές εργασίες, έχουμε ό,τι χρειάζεσαι.";

  const fallbackImage =
    "https://res.cloudinary.com/ddejhvzbf/image/upload/v1723560374/doulitsa_92f5bf4005.png";

  const meta = {
    metadataBase: new URL("https://doulitsa.gr"),
    title,
    description: truncatedDescription || fallbackDescription,
    openGraph: {
      title,
      description: truncatedDescription || fallbackDescription,
      url: `https://doulitsa.gr${url}`,
      siteName: "Doulitsa",
      images: [
        {
          url: !image || image === "" ? fallbackImage : image,
          width: 1600,
          height: 900,
          alt: title,
        },
      ],
      locale: "el_GR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: truncatedDescription || fallbackDescription,
      creator: "@doulitsa",
      images: [
        {
          url: !image || image === "" ? fallbackImage : image,
          width: 1600,
          height: 900,
          alt: title,
        },
      ],
    },
    alternates: {
      canonical: `https://doulitsa.gr${url}`,
      languages: {
        "el-GR": `https://doulitsa.gr${url}`,
      },
    },
  };
  return { meta };
}
