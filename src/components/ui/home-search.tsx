'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/index';
import { Button } from '@/components/ui/button';

export interface HomeSearchProps extends React.HTMLAttributes<HTMLDivElement> {
  onSearch?: (query: string) => void;
  placeholder?: string;
  buttonText?: string;
}

const HomeSearch = React.forwardRef<HTMLDivElement, HomeSearchProps>(
  (
    {
      className,
      onSearch,
      placeholder = 'Τι ψάχνεις;',
      buttonText = 'Αναζήτηση',
      ...props
    },
    ref,
  ) => {
    const [query, setQuery] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(query);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    };

    return (
      <form onSubmit={handleSubmit} ref={ref} {...props}>
        <div
          className={cn(
            'relative z-10 bg-white rounded-full border border-gray-400 p-2.5 max-w-[550px]',
            className,
          )}
        >
          <div className='flex flex-col md:flex-row md:items-center min-h-[45px] gap-2.5 md:gap-3'>
            {/* Search input section */}
            <div className='flex-1 md:w-2/3'>
              <div className='relative'>
                <Search
                  className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 z-10'
                  size={16}
                />
                <input
                  type='text'
                  value={query}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  className='w-full h-11 bg-transparent border-none outline-none focus:ring-0 focus:border-none rounded-full pl-[50px] pr-4 py-2 text-[15px] font-sans placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                />
              </div>
            </div>

            {/* Button section */}
            <div className='flex-shrink-0 md:w-1/3'>
              <div className='text-center md:text-left h-full flex items-center justify-center md:justify-end'>
                <Button
                  type='submit'
                  className='w-full md:w-auto h-11 bg-[#198754] text-primary-foreground hover:bg-secondary font-medium rounded-[60px] px-5 py-1.5 text-[15px] border-none outline-none focus:outline-none focus:ring-0 transition-all duration-[400ms] ease-in-out inline-block relative overflow-hidden text-center z-0'
                >
                  {buttonText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  },
);

HomeSearch.displayName = 'HomeSearch';

export { HomeSearch };
