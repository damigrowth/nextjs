'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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

export interface ComboboxOption {
  id: string;
  label: string;
  [key: string]: any; // Allow additional properties
}

export interface ComboboxProps {
  // Data
  options: ComboboxOption[];
  value?: string;
  onSelect: (option: ComboboxOption) => void;

  // Display
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  formatLabel?: (option: ComboboxOption) => React.ReactNode;
  getButtonLabel?: (option: ComboboxOption | undefined) => string;

  // Styling
  className?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onSelect,
  placeholder = 'Επιλογή...',
  searchPlaceholder = 'Αναζήτηση...',
  emptyMessage = 'Δεν βρέθηκαν αποτελέσματα.',
  formatLabel,
  getButtonLabel,
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

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
    (option: ComboboxOption) => {
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
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
