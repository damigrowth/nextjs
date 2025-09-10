import React from 'react';

/**
 * Formats bio text with line breaks into proper HTML structure
 * Preserves formatting from the legacy Strapi system
 */
export function formatBio(text: string): React.ReactNode[] {
  return text
    .split('\n')
    .map((line, index) =>
      line.trim() !== '' ? (
        <p key={index} className='text-muted-foreground mb-2'>
          {line}
        </p>
      ) : (
        <div key={index} className='h-2' />
      )
    );
}