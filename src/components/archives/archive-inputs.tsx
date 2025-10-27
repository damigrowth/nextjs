'use client';

import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { DatasetItem } from '@/lib/types/datasets';
import { archiveSortOptions } from '@/constants/datasets/options';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onValueChange,
  placeholder = 'Αναζήτηση...',
  className,
}: SearchInputProps) {
  const handleClear = () => {
    onValueChange('');
  };

  return (
    <div className={`relative ${className || ''}`}>
      <Search
        className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'
        size={16}
      />
      <Input
        type='text'
        value={value || ''}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className='pl-9 pr-9'
      />
      {value && (
        <button
          type='button'
          onClick={handleClear}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

interface OnlineToggleProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function OnlineToggle({
  id,
  checked,
  onCheckedChange,
  label = 'Online',
  className,
}: OnlineToggleProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className='text-sm font-medium cursor-pointer'>
        {label}
      </Label>
    </div>
  );
}

interface CountiesDropdownProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  counties: DatasetItem[];
  placeholder?: string;
  allLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  fullWidth?: boolean;
}

export function CountiesDropdown({
  value,
  onValueChange,
  counties,
  placeholder = 'Όλες οι περιοχές',
  allLabel = 'Όλες οι περιοχές',
  searchPlaceholder = 'Αναζήτηση περιοχής...',
  emptyMessage = 'Δεν βρέθηκαν περιοχές.',
  className,
  fullWidth = true,
}: CountiesDropdownProps) {
  const handleValueChange = (selectedValue: string) => {
    onValueChange(selectedValue === 'all' ? '' : selectedValue);
  };

  // Find county by slug or name for backward compatibility
  const selectedCounty =
    value && value !== 'all'
      ? counties.find((c) => c.slug === value || c.name === value)
      : null;

  const displayValue = selectedCounty?.name || allLabel;

  return (
    <div className={`${fullWidth ? 'min-w-48' : ''} ${className || ''}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className={`${fullWidth ? 'w-full' : ''} justify-between`}
          >
            {displayValue}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key='all'
                  onSelect={() => handleValueChange('all')}
                >
                  <Check
                    className={
                      !value || value === '' || value === 'all'
                        ? 'mr-2 h-4 w-4 opacity-100'
                        : 'mr-2 h-4 w-4 opacity-0'
                    }
                  />
                  {allLabel}
                </CommandItem>
                {counties.map((county) => (
                  <CommandItem
                    key={county.id}
                    value={county.name}
                    onSelect={() =>
                      handleValueChange(county.slug || county.name)
                    }
                  >
                    <Check
                      className={
                        value &&
                        (value === county.slug || value === county.name)
                          ? 'mr-2 h-4 w-4 opacity-100'
                          : 'mr-2 h-4 w-4 opacity-0'
                      }
                    />
                    {county.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface SortDropdownProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  fullWidth?: boolean;
}

export function SortDropdown({
  value,
  onValueChange,
  placeholder = 'Ταξινόμηση',
  searchPlaceholder = 'Αναζήτηση ταξινόμησης...',
  emptyMessage = 'Δεν βρέθηκαν επιλογές.',
  className,
  fullWidth = true,
}: SortDropdownProps) {
  const displayValue =
    value && value !== 'default'
      ? archiveSortOptions.find((option) => option.id === value)?.label ||
        placeholder
      : archiveSortOptions.find((option) => option.id === 'default')?.label ||
        placeholder;

  return (
    <div className={`${fullWidth ? 'min-w-48' : ''} ${className || ''}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className={`${fullWidth ? 'w-full' : ''} justify-between`}
          >
            {displayValue}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {archiveSortOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label}
                    onSelect={() => onValueChange(option.id)}
                  >
                    <Check
                      className={
                        (value || 'default') === option.id
                          ? 'mr-2 h-4 w-4 opacity-100'
                          : 'mr-2 h-4 w-4 opacity-0'
                      }
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface CategoryDropdownProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  categories: DatasetItem[];
  placeholder?: string;
  allLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  fullWidth?: boolean;
}

export function CategoryDropdown({
  value,
  onValueChange,
  categories,
  placeholder = 'Όλες οι κατηγορίες',
  allLabel = 'Όλες οι κατηγορίες',
  searchPlaceholder = 'Αναζήτηση κατηγορίας...',
  emptyMessage = 'Δεν βρέθηκαν κατηγορίες.',
  className,
  fullWidth = true,
}: CategoryDropdownProps) {
  const handleValueChange = (selectedValue: string) => {
    onValueChange(selectedValue === 'all' ? '' : selectedValue);
  };

  const selectedCategory =
    value && value !== 'all'
      ? categories.find((c) => c.id === value || c.slug === value)
      : null;

  const displayValue =
    selectedCategory?.plural || selectedCategory?.label || allLabel;

  return (
    <div className={`${fullWidth ? 'min-w-48' : ''} ${className || ''}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className={`${fullWidth ? 'w-full' : ''} justify-between`}
          >
            {displayValue}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key='all'
                  onSelect={() => handleValueChange('all')}
                >
                  <Check
                    className={
                      !value || value === '' || value === 'all'
                        ? 'mr-2 h-4 w-4 opacity-100'
                        : 'mr-2 h-4 w-4 opacity-0'
                    }
                  />
                  {allLabel}
                </CommandItem>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.label}
                    onSelect={() => handleValueChange(category.id)}
                  >
                    <Check
                      className={
                        value && value === category.id
                          ? 'mr-2 h-4 w-4 opacity-100'
                          : 'mr-2 h-4 w-4 opacity-0'
                      }
                    />
                    {category.plural || category.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface SubcategoryDropdownProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  subcategories: DatasetItem[];
  disabled?: boolean;
  placeholder?: string;
  allLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  fullWidth?: boolean;
}

export function SubcategoryDropdown({
  value,
  onValueChange,
  subcategories,
  disabled = false,
  placeholder = 'Όλες οι υποκατηγορίες',
  allLabel = 'Όλες οι υποκατηγορίες',
  searchPlaceholder = 'Αναζήτηση υποκατηγορίας...',
  emptyMessage = 'Δεν βρέθηκαν υποκατηγορίες.',
  className,
  fullWidth = true,
}: SubcategoryDropdownProps) {
  const handleValueChange = (selectedValue: string) => {
    onValueChange(selectedValue === 'all' ? '' : selectedValue);
  };

  const selectedSubcategory =
    value && value !== 'all'
      ? subcategories.find((c) => c.id === value || c.slug === value)
      : null;

  const displayValue =
    selectedSubcategory?.plural || selectedSubcategory?.label || allLabel;

  return (
    <div className={`${fullWidth ? 'min-w-48' : ''} ${className || ''}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            disabled={disabled}
            className={`${fullWidth ? 'w-full' : ''} justify-between`}
          >
            {displayValue}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key='all'
                  onSelect={() => handleValueChange('all')}
                >
                  <Check
                    className={
                      !value || value === '' || value === 'all'
                        ? 'mr-2 h-4 w-4 opacity-100'
                        : 'mr-2 h-4 w-4 opacity-0'
                    }
                  />
                  {allLabel}
                </CommandItem>
                {subcategories.map((subcategory) => (
                  <CommandItem
                    key={subcategory.id}
                    value={subcategory.label}
                    onSelect={() => handleValueChange(subcategory.id)}
                  >
                    <Check
                      className={
                        value && value === subcategory.id
                          ? 'mr-2 h-4 w-4 opacity-100'
                          : 'mr-2 h-4 w-4 opacity-0'
                      }
                    />
                    {subcategory.plural || subcategory.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface SubdivisionDropdownProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  subdivisions: DatasetItem[];
  disabled?: boolean;
  placeholder?: string;
  allLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  fullWidth?: boolean;
}

export function SubdivisionDropdown({
  value,
  onValueChange,
  subdivisions,
  disabled = false,
  placeholder = 'Όλοι οι τομείς',
  allLabel = 'Όλοι οι τομείς',
  searchPlaceholder = 'Αναζήτηση τομέα...',
  emptyMessage = 'Δεν βρέθηκαν τομείς.',
  className,
  fullWidth = true,
}: SubdivisionDropdownProps) {
  const handleValueChange = (selectedValue: string) => {
    onValueChange(selectedValue === 'all' ? '' : selectedValue);
  };

  const selectedSubdivision =
    value && value !== 'all'
      ? subdivisions.find((c) => c.id === value || c.slug === value)
      : null;

  const displayValue = selectedSubdivision?.label || allLabel;

  return (
    <div className={`${fullWidth ? 'min-w-48' : ''} ${className || ''}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            disabled={disabled}
            className={`${fullWidth ? 'w-full' : ''} justify-between`}
          >
            {displayValue}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key='all'
                  onSelect={() => handleValueChange('all')}
                >
                  <Check
                    className={
                      !value || value === '' || value === 'all'
                        ? 'mr-2 h-4 w-4 opacity-100'
                        : 'mr-2 h-4 w-4 opacity-0'
                    }
                  />
                  {allLabel}
                </CommandItem>
                {subdivisions.map((subdivision) => (
                  <CommandItem
                    key={subdivision.id}
                    value={subdivision.label}
                    onSelect={() => handleValueChange(subdivision.id)}
                  >
                    <Check
                      className={
                        value && value === subdivision.id
                          ? 'mr-2 h-4 w-4 opacity-100'
                          : 'mr-2 h-4 w-4 opacity-0'
                      }
                    />
                    {subdivision.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface TypeDropdownProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
  className?: string;
  fullWidth?: boolean;
}

const typeOptions = [
  { id: 'all', label: 'Όλοι' },
  { id: 'pros', label: 'Μόνο Επαγγελματίες' },
  { id: 'companies', label: 'Μόνο Επιχειρήσεις' },
];

export function TypeDropdown({
  value,
  onValueChange,
  placeholder = 'Τύπος',
  allLabel = 'Όλοι',
  className,
  fullWidth = true,
}: TypeDropdownProps) {
  const handleValueChange = (selectedValue: string) => {
    onValueChange(selectedValue === 'all' ? '' : selectedValue);
  };

  const selectedType =
    value && value !== 'all'
      ? typeOptions.find((t) => t.id === value)
      : null;

  const displayValue = selectedType?.label || allLabel;

  return (
    <div className={cn(fullWidth && 'min-w-48', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className={cn(fullWidth && 'w-full', 'justify-between')}
          >
            {displayValue}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
          <Command>
            <CommandList>
              <CommandGroup>
                {typeOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label}
                    onSelect={() => handleValueChange(option.id)}
                  >
                    <Check
                      className={
                        (!value && option.id === 'all') || value === option.id
                          ? 'mr-2 h-4 w-4 opacity-100'
                          : 'mr-2 h-4 w-4 opacity-0'
                      }
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
