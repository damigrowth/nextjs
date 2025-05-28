import React from 'react';

import { ContactContent } from '@/components/content';
import { data } from '@/constants/contact';

export default function ContactPage() {
  return <ContactContent data={data} />;
}
