'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

interface YearPickerProps {
  value?: string;
  onValueChange?: (year: string) => void;
  placeholder?: string;
  className?: string;
  startYear?: number;
  endYear?: number;
}

export default function YearPicker({
  value,
  onValueChange,
  placeholder = 'Επιλέξτε έτος...',
  className,
  startYear = 1990,
  endYear = new Date().getFullYear(),
}: YearPickerProps) {
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [isOpen, setIsOpen] = React.useState(false);

  // Calculate years to display (12 years per view)
  const yearsPerView = 12;
  const startYearInView = Math.floor((currentYear - startYear) / yearsPerView) * yearsPerView + startYear;
  const endYearInView = Math.min(startYearInView + yearsPerView - 1, endYear);

  const years = React.useMemo(() => {
    const yearList = [];
    for (let year = startYearInView; year <= endYearInView; year++) {
      yearList.push(year);
    }
    return yearList;
  }, [startYearInView, endYearInView]);

  const handleYearSelect = (year: number) => {
    onValueChange?.(year.toString());
    setIsOpen(false);
  };

  const handlePrevious = () => {
    const newYear = currentYear - yearsPerView;
    if (newYear >= startYear) {
      setCurrentYear(newYear);
    }
  };

  const handleNext = () => {
    const newYear = currentYear + yearsPerView;
    if (newYear <= endYear) {
      setCurrentYear(newYear);
    }
  };

  const canGoPrevious = startYearInView > startYear;
  const canGoNext = endYearInView < endYear;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {value || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <div className='p-3'>
          {/* Header with navigation */}
          <div className='flex items-center justify-between mb-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className='h-7 w-7 p-0'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <div className='text-sm font-medium'>
              {startYearInView} - {endYearInView}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={handleNext}
              disabled={!canGoNext}
              className='h-7 w-7 p-0'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
          
          {/* Year grid */}
          <div className='grid grid-cols-4 gap-1'>
            {years.map((year) => (
              <Button
                key={year}
                variant={value === year.toString() ? 'default' : 'ghost'}
                size='sm'
                onClick={() => handleYearSelect(year)}
                className={cn(
                  'h-8 text-sm font-normal',
                  year === new Date().getFullYear() && value !== year.toString() &&
                    'bg-accent text-accent-foreground'
                )}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}