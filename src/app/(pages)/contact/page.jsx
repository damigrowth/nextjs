import React from 'react';

import { ContactContent } from '@/components/content';
import { data } from '@/constants/contact';

export const dynamic = 'force-static';
export const revalidate = false;

export default function ContactPage() {
  return <ContactContent data={data} />;
}
