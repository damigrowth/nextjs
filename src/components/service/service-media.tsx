import MediaGallery from '../shared/media-gallery';
import React from 'react';

type Props = {
  media: PrismaJson.Media;
};

export default function ServiceMedia({ media }: Props) {
  return <MediaGallery media={media} title='Γκαλερί' showCards={true} />;
}
