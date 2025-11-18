'use client';

import * as React from 'react';
import { NextLink as Link } from '@/components/shared';
import { Folder, FileText, Loader2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover';
import type { SearchSuggestionsResult } from '@/lib/types/search';

export interface SearchDropdownProps {
  suggestions: SearchSuggestionsResult | null;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSuggestion: (url: string) => void;
  children: React.ReactNode;
}

export function SearchDropdown({
  suggestions,
  isLoading,
  open,
  onOpenChange,
  onSelectSuggestion,
  children,
}: SearchDropdownProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      <PopoverContent
        className='w-[--radix-popover-trigger-width] p-0'
        align='start'
        side='bottom'
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {isLoading ? (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                <span className='ml-2 text-sm text-muted-foreground'>
                  Αναζήτηση...
                </span>
              </div>
            ) : !suggestions || !suggestions.hasResults ? (
              <CommandEmpty>Δεν βρέθηκαν αποτελέσματα</CommandEmpty>
            ) : (
              <>
                {/* Taxonomy Suggestions */}
                {suggestions.taxonomies.length > 0 && (
                  <CommandGroup heading='Κατηγορίες'>
                    {suggestions.taxonomies.map((taxonomy) => (
                      <CommandItem
                        key={taxonomy.id}
                        value={taxonomy.label}
                        onSelect={() => {
                          onSelectSuggestion(taxonomy.url);
                          onOpenChange(false);
                        }}
                        asChild
                      >
                        <Link
                          href={taxonomy.url}
                          className='flex items-center gap-3 cursor-pointer'
                        >
                          <Folder className='h-4 w-4 text-muted-foreground' />
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium truncate'>
                              {taxonomy.label}
                            </p>
                            <p className='text-xs text-muted-foreground truncate'>
                              {taxonomy.category}
                            </p>
                          </div>
                        </Link>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Service Suggestions */}
                {suggestions.services.length > 0 && (
                  <CommandGroup heading='Υπηρεσίες'>
                    {suggestions.services.map((service) => (
                      <CommandItem
                        key={service.id}
                        value={service.title}
                        onSelect={() => {
                          onSelectSuggestion(service.url);
                          onOpenChange(false);
                        }}
                        asChild
                      >
                        <Link
                          href={service.url}
                          className='flex items-center gap-3 cursor-pointer'
                        >
                          <FileText className='h-4 w-4 text-muted-foreground' />
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium truncate'>
                              {service.title}
                            </p>
                            <p className='text-xs text-muted-foreground truncate'>
                              {service.category}
                            </p>
                          </div>
                        </Link>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
