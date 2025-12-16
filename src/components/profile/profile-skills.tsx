import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProfileSkillsProps } from '@/lib/types/components';

/**
 * Modern ProfileSkills Component
 * Displays profile skills and specialization as badges
 */

export default function ProfileSkills({
  skills = [],
  speciality,
}: ProfileSkillsProps) {
  // Don't render if no skills or speciality
  if (skills.length === 0 && !speciality) {
    return null;
  }

  // Filter out speciality from skills to avoid duplication
  const filteredSkills = skills.filter((skill) => skill.label !== speciality);

  return (
    <Card className='rounded-lg border border-border bg-muted'>
      <CardHeader className='pb-6'>
        <CardTitle className='text-lg font-semibold'>Δεξιότητες</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap gap-1'>
          {/* Speciality badge with different styling */}
          {speciality && (
            <Badge
              variant='outline'
              className='inline-block text-sm font-semibold mb-1.5 mr-1.5 py-2 px-2 text-center border border-primary rounded-xl text-primary'
            >
              {speciality}
            </Badge>
          )}

          {/* Regular skills */}
          {filteredSkills.map((skill, index) => (
            <Badge
              key={index}
              variant='outline'
              className='inline-block text-sm font-semibold mb-1.5 mr-1.5 py-2 px-2 text-center border border-muted-foreground rounded-xl text-muted-foreground'
            >
              {skill.label}
            </Badge>
          ))}
        </div>

        {/* Show message if no skills to display */}
        {filteredSkills.length === 0 && !speciality && (
          <p className='text-sm text-muted-foreground italic'>
            Δεν έχουν καταχωρηθεί δεξιότητες
          </p>
        )}
      </CardContent>
    </Card>
  );
}
