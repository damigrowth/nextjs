import React from 'react';

interface CoverageDisplayProps {
  groupedCoverage: Array<{ county: string; areas: string[] }>;
}

/**
 * Component to display coverage areas grouped by county
 * Format: **County** (Area1, Area2) - **County2** (Area3, Area4)
 */
export default function CoverageDisplay({
  groupedCoverage,
}: CoverageDisplayProps) {
  if (!groupedCoverage || groupedCoverage.length === 0) {
    return null;
  }

  return (
    <>
      {groupedCoverage.map((item, index) => (
        <React.Fragment key={item.county}>
          {index > 0 && ' - '}
          <strong>{item.county}</strong>
          {item.areas.length > 0 && (
            <span className='font-normal'> ({item.areas.join(', ')})</span>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
