'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface LazyComboboxOption {
  id: string;
  label: string;
  [key: string]: any; // Allow additional properties
}

export interface LazyComboboxProps {
  // Data
  options: LazyComboboxOption[];
  value?: string;
  onSelect: (option: LazyComboboxOption) => void;

  // Display
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  formatLabel?: (option: LazyComboboxOption) => React.ReactNode;
  getButtonLabel?: (option: LazyComboboxOption | undefined) => string;

  // Lazy Loading
  initialLimit?: number;
  loadMoreThreshold?: number;
  loadMoreIncrement?: number;
  searchLimit?: number;

  // Styling
  className?: string;
  disabled?: boolean;

  // Progress indicator
  showProgress?: boolean;
  progressFormatter?: (current: number, total: number) => string;
}

export function LazyCombobox({
  options,
  value,
  onSelect,
  placeholder = 'Επιλογή...',
  searchPlaceholder = 'Αναζήτηση...',
  emptyMessage = 'Δεν βρέθηκαν αποτελέσματα.',
  formatLabel,
  getButtonLabel,
  initialLimit = 20,
  loadMoreThreshold = 100,
  loadMoreIncrement = 20,
  searchLimit = 100,
  className,
  disabled = false,
  showProgress = true,
  progressFormatter = (current, total) => `${current} από ${total}`,
}: LazyComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [displayLimit, setDisplayLimit] = React.useState(initialLimit);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Reset display limit when popover closes
  React.useEffect(() => {
    if (!open) {
      setDisplayLimit(initialLimit);
      setSearchQuery('');
    }
  }, [open, initialLimit]);

  // Filter and display logic
  const { displayedOptions, totalFiltered, isSearching } = React.useMemo(() => {
    const isSearching = searchQuery.length > 0;

    // Filter based on search
    const filtered = isSearching
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Apply limit
    const limited = isSearching
      ? filtered.slice(0, searchLimit)
      : filtered.slice(0, displayLimit);

    return {
      displayedOptions: limited,
      totalFiltered: filtered.length,
      isSearching,
    };
  }, [options, searchQuery, displayLimit, searchLimit]);

  // Scroll handler for lazy loading
  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (isSearching) return; // Don't paginate during search

      const target = event.currentTarget;
      const scrolledToBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight <
        loadMoreThreshold;

      if (scrolledToBottom && displayLimit < options.length) {
        setDisplayLimit((prev) =>
          Math.min(prev + loadMoreIncrement, options.length)
        );
      }
    },
    [isSearching, displayLimit, options.length, loadMoreThreshold, loadMoreIncrement]
  );

  // Get selected option
  const selectedOption = React.useMemo(
    () => options.find((option) => option.id === value),
    [options, value]
  );

  // Button label
  const buttonLabel = React.useMemo(() => {
    if (getButtonLabel) {
      return getButtonLabel(selectedOption);
    }
    return selectedOption?.label || placeholder;
  }, [selectedOption, getButtonLabel, placeholder]);

  // Option label formatter
  const renderLabel = React.useCallback(
    (option: LazyComboboxOption) => {
      if (formatLabel) {
        return formatLabel(option);
      }
      return option.label;
    },
    [formatLabel]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          {buttonLabel}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList ref={scrollRef} onScroll={handleScroll}>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {displayedOptions.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {renderLabel(option)}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Progress Indicator */}
            {showProgress && !isSearching && displayedOptions.length > 0 && (
              <div className='flex items-center justify-center gap-2 p-2 text-xs text-muted-foreground border-t'>
                {displayLimit < options.length ? (
                  <>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    <span>
                      {progressFormatter(displayLimit, options.length)}
                    </span>
                  </>
                ) : (
                  <span>
                    {progressFormatter(options.length, options.length)}
                  </span>
                )}
              </div>
            )}

            {/* Search Results Indicator */}
            {showProgress && isSearching && displayedOptions.length > 0 && (
              <div className='p-2 text-xs text-center text-muted-foreground border-t'>
                {totalFiltered > searchLimit
                  ? `Εμφάνιση ${searchLimit} από ${totalFiltered} αποτελέσματα`
                  : `${totalFiltered} αποτελέσματα`}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
