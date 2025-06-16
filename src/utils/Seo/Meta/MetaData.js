'use server';

import { truncateText } from '@/utils/truncateText';

export async function MetaData({ title, description, size, image, url }) {
  const truncatedDescription = truncateText(description, size);

  const fallbackDescription =
    'Ανακάλυψε εξειδικευμένους επαγγελματίες και υπηρεσίες από όλη την Ελλάδα. Από ψηφιακές υπηρεσίες έως τεχνικές εργασίες, έχουμε ό,τι χρειάζεσαι.';

  const fallbackImage =
    'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750076707/Static/doulitsa_zmuykg.png';

  const baseUrl = process.env.LIVE_URL;

  const meta = {
    metadataBase: new URL(baseUrl),
    title,
    description: truncatedDescription || fallbackDescription,
    openGraph: {
      title,
      description: truncatedDescription || fallbackDescription,
      url: `${baseUrl}${url}`,
      siteName: 'Doulitsa',
      images: [
        {
          url: !image || image === '' ? fallbackImage : image,
          width: 1600,
          height: 900,
          alt: title,
        },
      ],
      locale: 'el_GR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: truncatedDescription || fallbackDescription,
      creator: '@doulitsa',
      images: [
        {
          url: !image || image === '' ? fallbackImage : image,
          width: 1600,
          height: 900,
          alt: title,
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}${url}`,
      languages: {
        'el-GR': `${baseUrl}${url}`,
      },
    },
  };

  return { meta };
}
