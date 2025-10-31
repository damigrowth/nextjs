'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import SharedCoverageDisplay from '@/components/shared/coverage-display';

interface CoverageDisplayProps {
  variant?: 'compact' | 'full';
  className?: string;
  // Service type booleans to control what coverage to show
  online?: boolean;
  onbase?: boolean;
  onsite?: boolean;
  // Coverage location data (for onbase display)
  area?: string | null;
  county?: string | null;
  // Pre-computed grouped coverage from server (required for onsite)
  groupedCoverage: Array<{ county: string; areas: string[] }>;
}

export function CoverageDisplay({
  variant = 'compact',
  className,
  online,
  onbase,
  onsite,
  area,
  county,
  groupedCoverage,
}: CoverageDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Show nothing if no coverage info
  if (!online && !onbase && !onsite) {
    return null;
  }

  const totalAreas = groupedCoverage.reduce(
    (sum, item) => sum + item.areas.length,
    0,
  );

  // Get the coverage text based on type
  const getCoverageText = () => {
    if (online) {
      return 'Εξυπηρετεί Online';
    }

    if (onbase) {
      // Show area and county for onbase (e.g., "Εύοσμος, Θεσσαλονίκη")
      const areaName = area || '';
      const countyName = county || '';
      return `Εξυπηρετεί: ${areaName}${areaName && countyName ? ', ' : ''}${countyName}`;
    }

    if (onsite && groupedCoverage.length > 0) {
      // Show counties with grouped format
      return (
        <>
          Εξυπηρετεί:{' '}
          {groupedCoverage.map((item, index) => (
            <React.Fragment key={item.county}>
              {index > 0 && ', '}
              {item.county}
            </React.Fragment>
          ))}
        </>
      );
    }

    return null;
  };

  const coverageText = getCoverageText();
  const showExpandButton = onsite && totalAreas > 0;

  if (!coverageText) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Coverage Text */}
      <div className='text-sm text-gray-600'>
        {showExpandButton ? (
          <Popover open={isExpanded} onOpenChange={setIsExpanded}>
            <div className='flex items-center gap-1.5'>
              <MapPin className='w-4 h-4' />
              <PopoverTrigger asChild>
                <button className='text-left hover:text-gray-900 transition-colors cursor-pointer'>
                  <span>{coverageText}</span>
                  {isExpanded ? (
                    <ChevronUp className='w-4 h-4 inline ml-1' />
                  ) : (
                    <ChevronDown className='w-4 h-4 inline ml-1' />
                  )}
                </button>
              </PopoverTrigger>
            </div>

            <PopoverContent
              align='start'
              side='bottom'
              sideOffset={8}
              className='w-80 p-3'
            >
              <div className='text-xs text-gray-700'>
                <SharedCoverageDisplay groupedCoverage={groupedCoverage} />
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <div className='flex items-center gap-1.5'>
            <MapPin className='w-4 h-4' />
            {coverageText}
          </div>
        )}
      </div>
    </div>
  );
}
