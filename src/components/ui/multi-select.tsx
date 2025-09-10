'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';

export type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  className?: string;
  showClearAll?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  maxItems,
  className,
  showClearAll = true,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const selectedOptions = React.useMemo(
    () => options.filter((option) => selected.includes(option.value)),
    [options, selected],
  );

  const availableOptions = React.useMemo(
    () =>
      options.filter(
        (option) =>
          !selected.includes(option.value) &&
          option.label.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    [options, selected, inputValue],
  );

  const handleUnselect = React.useCallback(
    (optionValue: string) => {
      onChange(selected.filter((s) => s !== optionValue));
    },
    [selected, onChange],
  );

  const handleSelect = React.useCallback(
    (optionValue: string) => {
      if (maxItems && selected.length >= maxItems) {
        return;
      }
      onChange([...selected, optionValue]);
      setInputValue('');
    },
    [selected, onChange, maxItems],
  );

  const handleClearAll = React.useCallback(() => {
    onChange([]);
  }, [onChange]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '' && selectedOptions.length > 0) {
            handleUnselect(selectedOptions[selectedOptions.length - 1].value);
          }
        }
        if (e.key === 'Escape') {
          input.blur();
          setOpen(false);
        }
      }
    },
    [selectedOptions, handleUnselect],
  );

  const isMaxReached = maxItems ? selected.length >= maxItems : false;

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={`overflow-visible bg-transparent ${className || ''}`}
    >
      <div className='group relative flex items-center rounded-md border border-input px-4 py-2 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring'>
        <div className='flex flex-wrap gap-1 flex-1 pr-8'>
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant='default'
              className='hover:bg-primary/90'
            >
              {option.label}
              <button
                className='ml-1 rounded-full outline-none'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUnselect(option.value);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleUnselect(option.value)}
              >
                <X className='h-3 w-3 text-primary-foreground hover:text-primary-foreground' />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={
              isMaxReached ? `Maximum ${maxItems} items` : placeholder
            }
            disabled={isMaxReached}
            className='ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
          />
        </div>
        {showClearAll && selectedOptions.length > 0 && (
          <button
            type='button'
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted outline-none focus:ring-1 focus:ring-ring'
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={handleClearAll}
            title='Clear all selections'
          >
            <X className='h-4 w-4 text-muted-foreground hover:text-foreground' />
          </button>
        )}
      </div>
      <div className='relative'>
        <CommandList>
          {open && availableOptions.length > 0 && !isMaxReached ? (
            <div className='absolute top-2 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in'>
              <CommandGroup className='h-full overflow-auto max-h-64'>
                {availableOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => handleSelect(option.value)}
                    className='cursor-pointer'
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  );
}
