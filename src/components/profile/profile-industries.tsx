import React from 'react';
import { Badge } from '@/components/ui/badge';

type ProfileIndustriesProps = {
  industries: string[];
};

export default function ProfileIndustries({
  industries,
}: ProfileIndustriesProps) {
  // Early return if no industries
  if (!industries || industries.length === 0) {
    return null;
  }

  return (
    <section className='py-5'>
      <h6 className='font-bold text-foreground mb-5'>Κύριοι Κλάδοι Πελατών</h6>
      <ul className='flex flex-wrap justify-start pt-2 m-0 p-0 gap-1.5'>
        {industries.map((industry, index) => (
          <li key={index} className='list-none'>
            <Badge
              variant='outline'
              className='inline-block text-sm font-semibold mb-1 mr-1 py-2 px-2 text-center bg-orangy text-orangy-foreground border border-orangy-foreground rounded-xl'
            >
              {industry}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}
