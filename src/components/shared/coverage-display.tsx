'use client';

import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const COLLAPSE_THRESHOLD = 10;

interface CoverageDisplayProps {
  groupedCoverage: Array<{ county: string; areas: string[] }>;
  /** When false, always renders the full inline list (no popover). Default: true */
  collapse?: boolean;
}

/**
 * Component to display coverage areas grouped by county
 * Format: **County** (Area1, Area2), **County2** (Area3, Area4)
 * Shows "X Νομοί" with click-to-expand popover when 10+ counties
 */
export default function CoverageDisplay({
  groupedCoverage,
  collapse = true,
}: CoverageDisplayProps) {
  if (!groupedCoverage || groupedCoverage.length === 0) {
    return null;
  }

  const totalItems = groupedCoverage.reduce(
    (sum, item) => sum + 1 + item.areas.length,
    0,
  );

  const shouldCollapse = collapse && totalItems >= COLLAPSE_THRESHOLD;

  const fullList = (
    <>
      {groupedCoverage.map((item, index) => (
        <React.Fragment key={item.county}>
          {index > 0 && ', '}
          <strong>{item.county}</strong>
          {item.areas.length > 0 && (
            <span className='font-normal'> ({item.areas.join(', ')})</span>
          )}
        </React.Fragment>
      ))}
    </>
  );

  if (!shouldCollapse) {
    return fullList;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          className='text-primary hover:underline cursor-pointer'
        >
          {groupedCoverage.length} Νομοί
        </button>
      </PopoverTrigger>
      <PopoverContent className='max-w-80 max-h-64 overflow-y-auto text-sm font-medium text-muted-foreground'>
        {fullList}
      </PopoverContent>
    </Popover>
  );
}
